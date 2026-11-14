import fs from 'fs';
import path from 'path';
import { BuilderSection, BuilderSnapshot } from '@/types';
import { getThemeConfig, updateThemeConfig } from '@/lib/themeService';
import { defaultHomepageContent } from '@/data/defaultHomepageContent';
import { logAuditEvent } from '@/lib/auditService';

const VERSIONS_PATH = path.join(process.cwd(), 'src', 'data', 'builder_versions.json');
const DRAFT_PATH = path.join(process.cwd(), 'src', 'data', 'builder_draft.json');
const HOMEPAGE_CONTENT_PATH = path.join(process.cwd(), 'src', 'data', 'homepage_content.json');

export const defaultSectionsOrder: BuilderSection[] = [
  { id: 'hero', type: 'hero', nameEn: 'Heavyweight Hero Showcase', nameAr: 'شاشة البانر الرئيسية (الهوديز 500 GSM)', enabled: true, order: 1 },
  { id: 'offers', type: 'offers', nameEn: 'Caesar-Style Promotional Offers', nameAr: 'عروض وباندلات الشتاء (اختار عرضك)', enabled: true, order: 2 },
  { id: 'categories', type: 'categories', nameEn: 'Category Showcase & Garment Lab', nameAr: 'أقسام الكتالوج وتفاصيل الخامات', enabled: true, order: 3 },
  { id: 'products', type: 'products', nameEn: 'Heavyweight Product Grid', nameAr: 'شبكة المنتجات ومواصفات القطع', enabled: true, order: 4 },
  { id: 'story', type: 'story', nameEn: 'Brand Story & Atelier Philosophy', nameAr: 'قصة وفلسفة دار أثير في مصر', enabled: true, order: 5 },
  { id: 'future', type: 'future', nameEn: 'Future Drop Teaser (320 GSM Tees)', nameAr: 'الإصدار القادم (تي شيرتات الصيف)', enabled: true, order: 6 },
  { id: 'features', type: 'features', nameEn: 'Luxury Features & COD Guarantee', nameAr: 'المميزات وضمان المعاينة مع المندوب', enabled: true, order: 7 },
  { id: 'faq', type: 'faq', nameEn: 'Interactive FAQ Accordions', nameAr: 'الأسئلة الشائعة وإرشادات المقاسات', enabled: true, order: 8 },
  { id: 'newsletter', type: 'newsletter', nameEn: 'VIP Drop Club Membership', nameAr: 'نادي النخبة والنشرة البريدية', enabled: true, order: 9 },
];

export function getSectionsOrder(): BuilderSection[] {
  try {
    if (fs.existsSync(HOMEPAGE_CONTENT_PATH)) {
      const data = JSON.parse(fs.readFileSync(HOMEPAGE_CONTENT_PATH, 'utf8'));
      if (Array.isArray(data.sectionsOrder) && data.sectionsOrder.length > 0) {
        return data.sectionsOrder;
      }
    }
  } catch (e) {
    console.error('[BuilderService] Failed to read sections order', e);
  }
  return defaultSectionsOrder;
}

export function getBuilderDraft(): any {
  try {
    if (fs.existsSync(DRAFT_PATH)) {
      return JSON.parse(fs.readFileSync(DRAFT_PATH, 'utf8'));
    }
  } catch (e) {
    console.error('[BuilderService] Failed to read draft', e);
  }
  return null;
}

export function saveBuilderDraft(draftData: any, authorEmail: string): boolean {
  try {
    fs.writeFileSync(DRAFT_PATH, JSON.stringify({ ...draftData, savedAt: new Date().toISOString(), authorEmail }, null, 2), 'utf8');
    logAuditEvent(authorEmail, 'SAVE_DRAFT', 'Builder', 'Saved visual builder draft changes');
    return true;
  } catch (e) {
    console.error('[BuilderService] Failed to save draft', e);
    return false;
  }
}

export function getBuilderVersions(): any[] {
  try {
    if (fs.existsSync(VERSIONS_PATH)) {
      return JSON.parse(fs.readFileSync(VERSIONS_PATH, 'utf8'));
    }
  } catch (e) {
    console.error('[BuilderService] Failed to read versions', e);
  }
  return [];
}

export function publishBuilderContent(payload: { homepageContent: any; themeConfig?: any; sectionsOrder?: BuilderSection[]; summary?: string }, authorEmail: string): boolean {
  try {
    // 1. Update published homepage_content.json
    let currentContent: any = defaultHomepageContent;
    if (fs.existsSync(HOMEPAGE_CONTENT_PATH)) {
      currentContent = JSON.parse(fs.readFileSync(HOMEPAGE_CONTENT_PATH, 'utf8'));
    }

    const mergedContent = {
      ...currentContent,
      ...payload.homepageContent,
      sectionsOrder: payload.sectionsOrder || currentContent.sectionsOrder || defaultSectionsOrder,
      updatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(HOMEPAGE_CONTENT_PATH, JSON.stringify(mergedContent, null, 2), 'utf8');

    // 2. Update theme config if provided
    if (payload.themeConfig) {
      updateThemeConfig(payload.themeConfig);
    }

    // 3. Save snapshot version in versions store
    const versions = getBuilderVersions();
    const newVersionNumber = versions.length + 1;
    const snapshot: any = {
      id: `v-${Date.now()}`,
      version: newVersionNumber,
      timestamp: new Date().toISOString(),
      authorEmail: authorEmail || 'owner@atheer.store',
      summary: payload.summary || `Published version ${newVersionNumber}`,
      homepageContent: mergedContent,
      themeConfig: getThemeConfig(),
      sectionsOrder: mergedContent.sectionsOrder,
    };
    versions.unshift(snapshot);
    // Keep last 30 versions
    fs.writeFileSync(VERSIONS_PATH, JSON.stringify(versions.slice(0, 30), null, 2), 'utf8');

    // 4. Log audit event
    logAuditEvent(authorEmail, 'PUBLISH_STOREFRONT', 'Builder', `Published website layout v${newVersionNumber}: ${snapshot.summary}`);

    // Clean up draft file
    if (fs.existsSync(DRAFT_PATH)) {
      try { fs.unlinkSync(DRAFT_PATH); } catch (e) {}
    }

    return true;
  } catch (e) {
    console.error('[BuilderService] Failed to publish builder content', e);
    return false;
  }
}

export function rollbackBuilderVersion(versionId: string, authorEmail: string): boolean {
  try {
    const versions = getBuilderVersions();
    const target = versions.find((v) => v.id === versionId);
    if (!target) return false;

    // Restore content
    if (target.homepageContent) {
      fs.writeFileSync(HOMEPAGE_CONTENT_PATH, JSON.stringify(target.homepageContent, null, 2), 'utf8');
    }
    // Restore theme
    if (target.themeConfig) {
      updateThemeConfig(target.themeConfig);
    }

    logAuditEvent(authorEmail, 'ROLLBACK_VERSION', 'Builder', `Rolled back website to version ${target.version} (${target.timestamp})`);
    return true;
  } catch (e) {
    console.error('[BuilderService] Failed to rollback version', e);
    return false;
  }
}
