-- =====================================================================
-- ATHEER STORE — Milestone 2.5 & 3: Egypt Market & Admin Entities
-- =====================================================================

-- 1. PROFILES & ADMIN ROLES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'super_admin')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. COUPONS & DISCOUNTS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
    min_order_amount NUMERIC(10, 2) DEFAULT 0 CHECK (min_order_amount >= 0),
    max_discount_amount NUMERIC(10, 2) CHECK (max_discount_amount >= 0),
    expires_at TIMESTAMPTZ,
    usage_limit INTEGER CHECK (usage_limit > 0),
    times_used INTEGER DEFAULT 0 CHECK (times_used >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'main_settings',
    store_name_en TEXT DEFAULT 'ATHEER' NOT NULL,
    store_name_ar TEXT DEFAULT 'أثير' NOT NULL,
    tagline_en TEXT DEFAULT 'PREMIUM YOUTH STREETWEAR' NOT NULL,
    tagline_ar TEXT DEFAULT 'أزياء الشارع الراقية للشباب' NOT NULL,
    whatsapp_number TEXT DEFAULT '201000000000' NOT NULL,
    support_email TEXT DEFAULT 'concierge@atheer.store' NOT NULL,
    default_currency TEXT DEFAULT 'EGP' NOT NULL,
    cairo_showrooms_en TEXT DEFAULT 'New Cairo · Sheikh Zayed' NOT NULL,
    cairo_showrooms_ar TEXT DEFAULT 'القاهرة الجديدة · الشيخ زايد' NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    alt_text TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. UPDATE SHIPPING ZONES TO INCLUDE EGYPTIAN GOVERNORATES
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'shipping_zones' AND column_name = 'governorates'
    ) THEN
        ALTER TABLE public.shipping_zones ADD COLUMN governorates TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
END $$;

-- Populate Egyptian Shipping Zones in Database
INSERT INTO public.shipping_zones (id, name_en, name_ar, countries, governorates, base_fee, free_shipping_threshold, estimated_days_en, estimated_days_ar, cod_available, is_active)
VALUES
('cairo-giza', 'Greater Cairo & Giza', 'القاهرة الكبرى والجيزة', ARRAY['EG'], ARRAY['Cairo', 'Giza'], 60.00, 1800.00, '1-2 Business Days', '١-٢ أيام عمل', true, true),
('alex-delta', 'Alexandria & Delta Governorates', 'الإسكندرية ومحافظات الدلتا', ARRAY['EG'], ARRAY['Alexandria', 'Beheira', 'Gharbia', 'Dakahlia', 'Sharqia', 'Monufia', 'Qalyubia', 'Kafr El Sheikh', 'Damietta'], 75.00, 2000.00, '2-3 Business Days', '٢-٣ أيام عمل', true, true),
('canal-cities', 'Canal Zone', 'مدن القناة', ARRAY['EG'], ARRAY['Port Said', 'Ismailia', 'Suez'], 85.00, 2200.00, '2-3 Business Days', '٢-٣ أيام عمل', true, true),
('upper-egypt', 'Upper Egypt Governorates', 'محافظات الصعيد', ARRAY['EG'], ARRAY['Faiyum', 'Beni Suef', 'Minya', 'Asyut', 'Sohag', 'Qena', 'Luxor', 'Aswan'], 95.00, 2500.00, '3-4 Business Days', '٣-٤ أيام عمل', true, true),
('coastal-remote', 'Coastal & Frontier Governorates', 'المحافظات الساحلية والحدودية', ARRAY['EG'], ARRAY['Red Sea', 'South Sinai', 'North Sinai', 'Matrouh', 'New Valley'], 120.00, 2800.00, '3-5 Business Days', '٣-٥ أيام عمل', true, true)
ON CONFLICT (id) DO UPDATE SET
    base_fee = EXCLUDED.base_fee,
    free_shipping_threshold = EXCLUDED.free_shipping_threshold,
    governorates = EXCLUDED.governorates;

-- SEED INITIAL STORE SETTINGS
INSERT INTO public.store_settings (id, store_name_en, store_name_ar, whatsapp_number, default_currency)
VALUES ('main_settings', 'ATHEER', 'أثير', '201000000000', 'EGP')
ON CONFLICT (id) DO NOTHING;

-- SEED INITIAL COUPONS (e.g. ATHEER10, YOUTH15, WELCOME100)
INSERT INTO public.coupons (code, discount_type, discount_value, min_order_amount, is_active)
VALUES
('ATHEER10', 'percentage', 10.00, 1000.00, true),
('YOUTH15', 'percentage', 15.00, 1500.00, true),
('WELCOME100', 'fixed', 100.00, 1200.00, true)
ON CONFLICT (code) DO NOTHING;

-- RLS POLICIES FOR NEW TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Public can read store settings and active coupons
CREATE POLICY "Public read store settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Public read active coupons" ON public.coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Public read product images" ON public.product_images FOR SELECT USING (true);

-- Profiles policy: Users read their own profile
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
