import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import {
  getAdminNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationsCount,
} from '@/data/adminNotificationsStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  const notifications = getAdminNotifications();
  const unreadCount = getUnreadNotificationsCount();

  return NextResponse.json({
    success: true,
    unreadCount,
    notifications,
  });
}

export async function PUT(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    const { id } = await req.json();

    if (id === 'all') {
      markAllNotificationsAsRead();
    } else if (id) {
      markNotificationAsRead(id);
    }

    return NextResponse.json({
      success: true,
      unreadCount: getUnreadNotificationsCount(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update notification' },
      { status: 500 }
    );
  }
}
