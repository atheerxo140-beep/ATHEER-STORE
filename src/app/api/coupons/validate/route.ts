import { NextRequest, NextResponse } from 'next/server';
import { getCouponByCode } from '@/data/couponsStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, subtotal } = body;

    if (!code || typeof subtotal !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Coupon code and subtotal are required.' },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    // 1. Check if Loyalty Reward Voucher (e.g. ATH-VIP-xxxx)
    try {
      const { validateLoyaltyVoucher } = await import('@/lib/loyaltyService');
      const loyaltyRes = validateLoyaltyVoucher(cleanCode);
      if (loyaltyRes.valid && loyaltyRes.discountAmount) {
        const discountAmount = Math.min(loyaltyRes.discountAmount, subtotal);
        return NextResponse.json({
          success: true,
          code: cleanCode,
          discountType: 'loyalty_reward',
          discountValue: loyaltyRes.discountAmount,
          discountAmount,
          newSubtotal: subtotal - discountAmount,
          messageAr: `تم تفعيل مكافأة بطاقة الأختام بقيمة ${loyaltyRes.discountAmount} ج.م`,
        });
      }
    } catch (e) {}

    // 2. Check Promotion Rules (e.g. FAMILY15 bundle or promo rules)
    try {
      const { evaluateCartPromotions } = await import('@/lib/promotionService');
      const promoRes = evaluateCartPromotions(body.itemCount || 1, subtotal, cleanCode);
      if (promoRes.appliedDiscount > 0) {
        return NextResponse.json({
          success: true,
          code: promoRes.promoCode,
          discountType: promoRes.promoType || 'bundle_items',
          discountValue: promoRes.appliedDiscount,
          discountAmount: promoRes.appliedDiscount,
          newSubtotal: subtotal - promoRes.appliedDiscount,
          messageAr: promoRes.promoTitleAr || 'تم تطبيق خصم العرض بنجاح',
        });
      }
    } catch (e) {}

    const coupon = getCouponByCode(cleanCode);
    if (!coupon) {
      return NextResponse.json(
        {
          success: false,
          error: 'Coupon code is invalid or has expired.',
          errorAr: 'كوبون الخصم غير صحيح أو منتهي الصلاحية.',
        },
        { status: 404 }
      );
    }

    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum order amount for this coupon is ${coupon.minOrderAmount} EGP.`,
          errorAr: `الحد الأدنى للطلب لتفعيل هذا الكوبون هو ${coupon.minOrderAmount} جنيه مصري.`,
        },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }

    return NextResponse.json({
      success: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      newSubtotal: subtotal - discountAmount,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
