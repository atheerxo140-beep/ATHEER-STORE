import { HomepageContent } from '@/types';
import fs from 'fs';
import path from 'path';
import { getSupabaseServer, isSupabaseConfigured } from '@/lib/supabaseServer';
import { defaultHomepageContent } from './defaultHomepageContent';

export { defaultHomepageContent };

const JSON_PATH = path.join(process.cwd(), 'src', 'data', 'homepage_content.json');

function loadLocalContent(): HomepageContent {
  try {
    if (fs.existsSync(JSON_PATH)) {
      const data = fs.readFileSync(JSON_PATH, 'utf8');
      const parsed = JSON.parse(data);
      if (parsed && parsed.heroTitleEn) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('[HomepageContentStore] Error reading local file:', err);
  }
  return { ...defaultHomepageContent };
}

function persistLocalContent(content: HomepageContent) {
  try {
    fs.writeFileSync(JSON_PATH, JSON.stringify(content, null, 2), 'utf8');
  } catch (err) {
    // Read-only filesystem on Vercel is expected and safe
    console.warn('[HomepageContentStore] Notice: read-only filesystem on serverless runtime.');
  }
}

// Global runtime instance
const globalForContent = global as unknown as { currentHomepageContent?: HomepageContent };
export const currentHomepageContent: HomepageContent =
  globalForContent.currentHomepageContent || loadLocalContent();

if (process.env.NODE_ENV !== 'production') {
  globalForContent.currentHomepageContent = currentHomepageContent;
}

export const getHomepageContent = async (): Promise<HomepageContent> => {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServer();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('*')
          .eq('id', 'homepage_content_row')
          .single();

        if (!error && data && data.cairo_showrooms_ar) {
          try {
            const cloudContent = JSON.parse(data.cairo_showrooms_ar) as HomepageContent;
            if (cloudContent && cloudContent.heroTitleAr) {
              const merged: HomepageContent = { ...defaultHomepageContent, ...cloudContent };
              Object.assign(currentHomepageContent, merged);
              return merged;
            }
          } catch (jsonErr) {
            console.warn('[HomepageContentStore] JSON parse error:', jsonErr);
          }
        }
      } catch (err) {
        // Fall back gracefully
      }
    }
  }

  return currentHomepageContent;
};

export const updateHomepageContent = async (
  newContent: Partial<HomepageContent>
): Promise<HomepageContent> => {
  const current = await getHomepageContent();
  const updated: HomepageContent = {
    ...current,
    ...newContent,
    updatedAt: new Date().toISOString(),
  };

  Object.assign(currentHomepageContent, updated);
  persistLocalContent(updated);

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServer();
    if (supabase) {
      try {
        const jsonStr = JSON.stringify(updated);
        await supabase
          .from('store_settings')
          .upsert({
            id: 'homepage_content_row',
            store_name_en: 'HOMEPAGE_CONTENT',
            store_name_ar: 'محتوى الواجهة',
            tagline_en: '',
            tagline_ar: '',
            whatsapp_number: '',
            support_email: '',
            default_currency: 'EGP',
            cairo_showrooms_en: 'ATH_CMS_STORAGE',
            cairo_showrooms_ar: jsonStr,
            updated_at: new Date().toISOString(),
          });
      } catch (err) {
        console.warn('[HomepageContentStore] Cloud persistence fallback:', err);
      }
    }
  }

  return updated;
};
