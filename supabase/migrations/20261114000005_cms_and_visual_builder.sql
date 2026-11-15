-- =====================================================================
-- ATHEER STORE — MIGRATION 05: CMS, VISUAL BUILDER & CUSTOM PAGES
-- =====================================================================

-- 1. Extend store_settings table for Visual Builder & Themes
ALTER TABLE IF EXISTS public.store_settings 
ADD COLUMN IF NOT EXISTS homepage_content JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS builder_draft JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS builder_versions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS theme_config JSONB DEFAULT '{}'::jsonb;

-- 2. Create custom_pages table for dynamic CMS content and policies
CREATE TABLE IF NOT EXISTS public.custom_pages (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    content_en TEXT NOT NULL,
    content_ar TEXT NOT NULL,
    meta_description_en TEXT,
    meta_description_ar TEXT,
    is_published BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on custom_pages
ALTER TABLE public.custom_pages ENABLE ROW LEVEL SECURITY;

-- Allow public read of published pages
CREATE POLICY "Public can view published custom pages"
ON public.custom_pages FOR SELECT
USING (is_published = TRUE);

-- Allow authenticated admins full control over custom pages
CREATE POLICY "Admins full control on custom pages"
ON public.custom_pages FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'owner', 'super_admin')
    )
);

-- Service role bypass
CREATE POLICY "Service role full access on custom pages"
ON public.custom_pages FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
