import fs from 'fs';
import path from 'path';
import { CustomPage } from '@/types';
import { getStoreFilePath } from '@/lib/storePath';

const getStorePath = () => getStoreFilePath('pages_store.json');

export function getAllPages(): CustomPage[] {
  try {
    const filePath = getStorePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('[PageService] Failed to read pages', e);
  }
  return [];
}

export function getPageBySlug(slug: string): CustomPage | null {
  const pages = getAllPages();
  const clean = slug.toLowerCase().trim();
  return pages.find((p) => p.slug.toLowerCase().trim() === clean && p.isPublished) || null;
}

export function savePage(pageData: Partial<CustomPage> & { titleEn: string; titleAr: string; slug: string }): CustomPage {
  const pages = getAllPages();
  const slug = pageData.slug.toLowerCase().trim().replace(/[^a-z0-9\-]/g, '-');

  const existingIdx = pages.findIndex((p) => p.slug === slug || (pageData.id && p.id === pageData.id));

  const pageToSave: CustomPage = {
    id: pageData.id || `page-${Date.now()}`,
    slug,
    titleEn: pageData.titleEn.trim(),
    titleAr: pageData.titleAr.trim(),
    seoTitleEn: pageData.seoTitleEn?.trim() || pageData.titleEn.trim(),
    seoTitleAr: pageData.seoTitleAr?.trim() || pageData.titleAr.trim(),
    seoDescriptionEn: pageData.seoDescriptionEn?.trim() || '',
    seoDescriptionAr: pageData.seoDescriptionAr?.trim() || '',
    contentEn: pageData.contentEn || '',
    contentAr: pageData.contentAr || '',
    isPublished: pageData.isPublished !== undefined ? pageData.isPublished : true,
    showInHeader: pageData.showInHeader || false,
    showInFooter: pageData.showInFooter || false,
    updatedAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    pages[existingIdx] = pageToSave;
  } else {
    pages.push(pageToSave);
  }

  try {
    fs.writeFileSync(getStorePath(), JSON.stringify(pages, null, 2), 'utf8');
  } catch (e) {
    console.error('[PageService] Failed to write pages store', e);
  }

  return pageToSave;
}

export function deletePage(id: string): boolean {
  const pages = getAllPages();
  const filtered = pages.filter((p) => p.id !== id);
  if (filtered.length === pages.length) return false;

  try {
    fs.writeFileSync(getStorePath(), JSON.stringify(filtered, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('[PageService] Failed to delete page', e);
    return false;
  }
}
