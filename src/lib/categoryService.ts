import fs from 'fs';
import path from 'path';
import { CategoryItem } from '@/types';

const STORE_PATH = path.join(process.cwd(), 'src', 'data', 'categories_store.json');

export function getAllCategories(): CategoryItem[] {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const data = fs.readFileSync(STORE_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('[CategoryService] Failed to read categories', e);
  }
  return [];
}

export function saveCategory(catData: Partial<CategoryItem> & { nameEn: string; nameAr: string; slug: string }): CategoryItem {
  const categories = getAllCategories();
  const slug = catData.slug.toLowerCase().trim().replace(/[^a-z0-9\-]/g, '-');
  const existingIdx = categories.findIndex((c) => c.slug === slug || (catData.id && c.id === catData.id));

  const toSave: CategoryItem = {
    id: catData.id || `cat-${Date.now()}`,
    slug,
    nameEn: catData.nameEn.trim(),
    nameAr: catData.nameAr.trim(),
    descriptionEn: catData.descriptionEn?.trim() || '',
    descriptionAr: catData.descriptionAr?.trim() || '',
    image: catData.image?.trim() || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1200&auto=format&fit=crop',
    badgeEn: catData.badgeEn?.trim() || '',
    badgeAr: catData.badgeAr?.trim() || '',
    itemCount: catData.itemCount || 0,
    order: catData.order !== undefined ? catData.order : categories.length + 1,
    isActive: catData.isActive !== undefined ? catData.isActive : true,
  };

  if (existingIdx >= 0) {
    categories[existingIdx] = toSave;
  } else {
    categories.push(toSave);
  }

  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(categories, null, 2), 'utf8');
  } catch (e) {
    console.error('[CategoryService] Failed to write categories', e);
  }

  return toSave;
}

export function deleteCategory(id: string): boolean {
  const categories = getAllCategories();
  const filtered = categories.filter((c) => c.id !== id);
  if (filtered.length === categories.length) return false;

  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(filtered, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('[CategoryService] Failed to delete category', e);
    return false;
  }
}
