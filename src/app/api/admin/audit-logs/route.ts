import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogs } from '@/lib/auditService';
import { verifyAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  const logs = getAuditLogs();
  return NextResponse.json({ success: true, count: logs.length, logs });
}
