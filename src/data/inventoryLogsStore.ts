import fs from 'fs';
import path from 'path';

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

const LOGS_JSON_PATH = path.join(process.cwd(), 'src', 'data', 'inventory_logs_store.json');

function loadLogsFromDisk(): InventoryLog[] {
  try {
    if (fs.existsSync(LOGS_JSON_PATH)) {
      const data = fs.readFileSync(LOGS_JSON_PATH, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('[InventoryLogsStore] Error reading logs from disk:', err);
  }
  return [];
}

function persistLogsToDisk(logs: InventoryLog[]): void {
  try {
    fs.writeFileSync(LOGS_JSON_PATH, JSON.stringify(logs, null, 2), 'utf8');
  } catch (err) {
    console.warn('[InventoryLogsStore] Notice: Could not write logs to disk');
  }
}

const globalForLogs = global as unknown as { inventoryLogsStore?: InventoryLog[] };
export const inventoryLogsStore: InventoryLog[] =
  globalForLogs.inventoryLogsStore || loadLogsFromDisk();
globalForLogs.inventoryLogsStore = inventoryLogsStore;

export const addInventoryLog = (log: InventoryLog): InventoryLog => {
  inventoryLogsStore.unshift(log);
  persistLogsToDisk(inventoryLogsStore);
  return log;
};

export const getInventoryLogs = (limit = 50): InventoryLog[] => {
  return inventoryLogsStore.slice(0, limit);
};
