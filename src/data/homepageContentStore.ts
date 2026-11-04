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
          .select('homepage_content')
          .eq('id', 'main_settings')
          .single();

        if (!error && data && (data as any).homepage_content) {
          const cloudContent = (data as any).homepage_content as HomepageContent;
          Object.assign(currentHomepageContent, cloudContent);
          return cloudContent;
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
  const updated: HomepageContent = {
    ...currentHomepageContent,
    ...newContent,
    updatedAt: new Date().toISOString(),
  };

  Object.assign(currentHomepageContent, updated);
  persistLocalContent(updated);

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseServer();
    if (supabase) {
      try {
        await supabase
          .from('store_settings')
          .update({
            homepage_content: updated,
            updated_at: new Date().toISOString(),
          } as any)
          .eq('id', 'main_settings');
      } catch (err) {
        console.warn('[HomepageContentStore] Cloud persistence fallback:', err);
      }
    }
  }

  return updated;
};
