export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  adjustment: number;
  newTotal: number;
  reason: 'restock' | 'damage' | 'audit_correction' | 'sale';
  notes?: string;
  timestamp: string;
}

const globalForLogs = global as unknown as { inventoryLogsStore?: InventoryLog[] };
export const inventoryLogsStore: InventoryLog[] =
  globalForLogs.inventoryLogsStore || [];

if (process.env.NODE_ENV !== 'production') {
  globalForLogs.inventoryLogsStore = inventoryLogsStore;
}

export const addInventoryLog = (log: InventoryLog): InventoryLog => {
  inventoryLogsStore.unshift(log);
  return log;
};

export const getInventoryLogs = (limit = 50): InventoryLog[] => {
  return inventoryLogsStore.slice(0, limit);
};
