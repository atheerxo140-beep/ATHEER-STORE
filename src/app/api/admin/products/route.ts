import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, addProduct, updateProduct, deleteProduct } from '@/data/mockProducts';
import { Product } from '@/types';
import { verifyAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  const products = await getAllProducts();
  return NextResponse.json({
    success: true,
    count: products.length,
    products,
  });
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    const body = (await req.json()) as Partial<Product>;

    if (!body.nameEn || !body.nameAr || !body.price || !body.category) {
      return NextResponse.json(
        { success: false, error: 'Product English & Arabic names, category, and price are required.' },
        { status: 400 }
      );
    }

    const newProduct: Product = {
      id: body.id || `ath-prod-${Date.now()}`,
      nameEn: body.nameEn,
      nameAr: body.nameAr,
      category: body.category as any,
      categoryLabelEn: body.categoryLabelEn || body.category,
      categoryLabelAr: body.categoryLabelAr || body.category,
      price: Number(body.price),
      originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
      image: body.image || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000',
      hoverImage: body.hoverImage || body.image || 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1000',
      badgeEn: body.badgeEn,
      badgeAr: body.badgeAr,
      descriptionEn: body.descriptionEn || '',
      descriptionAr: body.descriptionAr || '',
      gsm: body.gsm ? Number(body.gsm) : 500,
      fitEn: body.fitEn || 'Signature Boxy Oversized',
      fitAr: body.fitAr || 'قصّة بوكسي أوفرسايز معتمدة',
      fabricEn: body.fabricEn || 'Heavyweight Cotton Fleece Blend (500 GSM Spec)',
      fabricAr: body.fabricAr || 'مزيج قطن صوف ثقيل فاخر (مواصفات 500 GSM)',
      colors: body.colors && body.colors.length > 0 ? body.colors : ['Onyx Black'],
      sizes: body.sizes && body.sizes.length > 0 ? body.sizes : ['S', 'M', 'L', 'XL', 'XXL'],
      isNewArrival: Boolean(body.isNewArrival),
      isBestseller: Boolean(body.isBestseller),
      isComingSoon: Boolean(body.isComingSoon),
      inventory: body.inventory !== undefined ? Number(body.inventory) : 50,
    };

    const saved = await addProduct(newProduct);
    return NextResponse.json({ success: true, product: saved }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required.' }, { status: 400 });
    }

    const updated = await updateProduct(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required.' }, { status: 400 });
    }

    const deleted = await deleteProduct(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Product ${id} deleted successfully.` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
