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

    // Validate mime type (Images & Videos for Hero & Media)
    const validImageMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif', 'image/avif'];
    const validVideoMimes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg', 'video/x-m4v', 'video/mov'];
    const isVideo = validVideoMimes.includes(file.type.toLowerCase()) || file.name.match(/\.(mp4|webm|mov|m4v|ogv)$/i);
    const isImage = validImageMimes.includes(file.type.toLowerCase()) || file.name.match(/\.(jpg|jpeg|png|webp|gif|avif)$/i);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { success: false, error: 'نوع الملف غير مدعوم. يرجى رفع صورة (PNG, JPG, WebP) أو فيديو (MP4, WebM, MOV).' },
        { status: 400 }
      );
    }

    // Validate size (max 80MB for videos, 15MB for images)
    const maxSizeBytes = isVideo ? 80 * 1024 * 1024 : 15 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        {
          success: false,
          error: isVideo
            ? 'حجم الفيديو يتجاوز الحد الأقصى (80 ميجابايت). يرجى ضغط الفيديو أو اختيار مقطع أقصر.'
            : 'حجم الصورة يتجاوز الحد الأقصى (15 ميجابايت).',
        },
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
