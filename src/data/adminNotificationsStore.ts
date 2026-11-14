export interface AdminNotification {
  id: string;
  type: 'new_order' | 'inventory_alert' | 'system';
  title: string;
  message: string;
  orderReference?: string;
  customerName?: string;
  customerPhone?: string;
  totalAmount?: number;
  createdAt: string;
  read: boolean;
}

// In-memory runtime store for notifications
const globalForNotifications = global as unknown as { adminNotifications?: AdminNotification[] };

export const adminNotificationsStore: AdminNotification[] =
  globalForNotifications.adminNotifications && Array.isArray(globalForNotifications.adminNotifications)
    ? globalForNotifications.adminNotifications
    : [];

if (process.env.NODE_ENV !== 'production') {
  globalForNotifications.adminNotifications = adminNotificationsStore;
}

export function addAdminNotification(
  notification: Omit<AdminNotification, 'id' | 'createdAt' | 'read'>
): AdminNotification {
  const newNotif: AdminNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    ...notification,
    createdAt: new Date().toISOString(),
    read: false,
  };

  adminNotificationsStore.unshift(newNotif);

  // Keep last 100 notifications
  if (adminNotificationsStore.length > 100) {
    adminNotificationsStore.length = 100;
  }

  return newNotif;
}

export function getAdminNotifications(): AdminNotification[] {
  return adminNotificationsStore;
}

export function markNotificationAsRead(id: string): boolean {
  const notif = adminNotificationsStore.find((n) => n.id === id);
  if (notif) {
    notif.read = true;
    return true;
  }
  return false;
}

export function markAllNotificationsAsRead(): void {
  adminNotificationsStore.forEach((n) => {
    n.read = true;
  });
}

export function getUnreadNotificationsCount(): number {
  return adminNotificationsStore.filter((n) => !n.read).length;
}
