import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, getProductById } from '@/data/mockProducts';
import { InventoryLog, getInventoryLogs, addInventoryLog } from '@/data/inventoryLogsStore';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  const products = getAllProducts();
  const inventoryItems = products.map((p) => ({
    id: p.id,
    nameEn: p.nameEn,
    nameAr: p.nameAr,
    category: p.category,
    price: p.price,
    inventory: p.inventory ?? 50,
    isLowStock: (p.inventory ?? 50) < 15,
    sizes: p.sizes,
    colors: p.colors,
  }));

  return NextResponse.json({
    success: true,
    items: inventoryItems,
    logs: getInventoryLogs(50),
  });
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, adjustment, reason, notes } = body;

    if (!productId || typeof adjustment !== 'number') {
      return NextResponse.json(
        { success: false, error: 'productId and numerical adjustment are required.' },
        { status: 400 }
      );
    }

    const product = getProductById(productId);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found.' }, { status: 404 });
    }

    const currentInventory = product.inventory ?? 50;
    const newInventory = currentInventory + adjustment;

    if (newInventory < 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Adjustment rejected. Current stock is ${currentInventory}. Cannot reduce below 0.`,
        },
        { status: 400 }
      );
    }

    product.inventory = newInventory;

    const log: InventoryLog = {
      id: `inv_log_${Date.now()}`,
      productId: product.id,
      productName: product.nameEn,
      adjustment,
      newTotal: newInventory,
      reason: reason || 'audit_correction',
      notes,
      timestamp: new Date().toISOString(),
    };
    addInventoryLog(log);

    return NextResponse.json({
      success: true,
      productId: product.id,
      previousInventory: currentInventory,
      newInventory,
      log,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
