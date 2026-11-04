import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer, isSupabaseConfigured } from '@/lib/supabaseServer';
import { verifyAdminRequest } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // 1. Verify Admin Request
  const auth = await verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.statusCode });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Validate mime type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
    if (!validMimes.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.' },
        { status: 400 }
      );
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds maximum 10MB limit.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
    const fileName = `${folder}/${Date.now()}_${cleanFileName}.${ext}`;

    // 2. Upload to Supabase Storage
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseServer();
      if (supabase) {
        const { data, error } = await supabase.storage
          .from('store-media')
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (!error && data) {
          const { data: pubData } = supabase.storage
            .from('store-media')
            .getPublicUrl(fileName);

          return NextResponse.json({
            success: true,
            url: pubData.publicUrl,
            fileName: data.path,
          });
        } else if (error) {
          console.error('[Supabase Storage Upload Error]', error);
        }
      }
    }

    // 3. Fallback: Base64 Data URL if Supabase Storage is not reachable
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
      fallback: true,
    });
  } catch (err: any) {
    console.error('[Upload Handler Exception]', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Upload processing failed' },
      { status: 500 }
    );
  }
}
