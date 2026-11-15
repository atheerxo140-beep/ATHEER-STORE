import fs from 'fs';
import path from 'path';
import { getStoreFilePath } from '@/lib/storePath';

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

function getLogsJsonPath(): string {
  try {
    return getStoreFilePath('inventory_logs_store.json');
  } catch (e) {
    return path.join(process.cwd(), 'src', 'data', 'inventory_logs_store.json');
  }
}

function loadLogsFromDisk(): InventoryLog[] {
  try {
    const filePath = getLogsJsonPath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
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
    const filePath = getLogsJsonPath();
    fs.writeFileSync(filePath, JSON.stringify(logs, null, 2), 'utf8');
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
