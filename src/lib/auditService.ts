import fs from 'fs';
import path from 'path';
import { AuditLog } from '@/types';

const STORE_PATH = path.join(process.cwd(), 'src', 'data', 'audit_logs_store.json');

export function getAuditLogs(): AuditLog[] {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const data = fs.readFileSync(STORE_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('[AuditService] Failed to read audit logs', e);
  }
  return [];
}

export function logAuditEvent(actorEmail: string, action: string, section: string, details: string, ip?: string): void {
  try {
    const logs = getAuditLogs();
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      actorEmail: actorEmail || 'system@atheer.store',
      action,
      section,
      details,
      ip,
    };
    logs.unshift(newLog);
    // Keep last 500 audit logs to prevent unbounded growth
    const trimmed = logs.slice(0, 500);
    fs.writeFileSync(STORE_PATH, JSON.stringify(trimmed, null, 2), 'utf8');
  } catch (e) {
    console.error('[AuditService] Failed to record audit log', e);
  }
}
