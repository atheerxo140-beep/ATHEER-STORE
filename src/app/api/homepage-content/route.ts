import { NextResponse } from 'next/server';
import { getHomepageContent } from '@/data/homepageContentStore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const content = await getHomepageContent();
    return NextResponse.json({
      success: true,
      content,
    });
  } catch (error: any) {
    console.error('Failed to get homepage content:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
