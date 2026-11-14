import { NextRequest, NextResponse } from 'next/server';
import {
  getSectionsOrder,
  getBuilderDraft,
  saveBuilderDraft,
  getBuilderVersions,
  publishBuilderContent,
  rollbackBuilderVersion,
} from '@/lib/builderService';
import { getThemeConfig } from '@/lib/themeService';
import { verifyAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  const sections = getSectionsOrder();
  const draft = getBuilderDraft();
  const versions = getBuilderVersions();
  const theme = getThemeConfig();

  return NextResponse.json({
    success: true,
    sections,
    draft,
    versions,
    theme,
  });
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    const body = await req.json();
    const action = body.action; // 'save_draft' | 'publish' | 'rollback'

    if (action === 'save_draft') {
      const ok = saveBuilderDraft(body.draftData, auth.user?.email || 'admin@atheer.store');
      return NextResponse.json({ success: ok });
    }

    if (action === 'publish') {
      const ok = publishBuilderContent(
        {
          homepageContent: body.homepageContent,
          themeConfig: body.themeConfig,
          sectionsOrder: body.sectionsOrder,
          summary: body.summary,
        },
        auth.user?.email || 'admin@atheer.store'
      );
      return NextResponse.json({ success: ok });
    }

    if (action === 'rollback') {
      if (!body.versionId) {
        return NextResponse.json({ success: false, error: 'Version ID required' }, { status: 400 });
      }
      const ok = rollbackBuilderVersion(body.versionId, auth.user?.email || 'admin@atheer.store');
      return NextResponse.json({ success: ok });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
