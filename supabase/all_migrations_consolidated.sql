-- =====================================================================
-- ATHEER STORE | Ø£Ø«ÙŠØ± â€” Database Schema Migration
-- Designed for PostgreSQL / Supabase
-- =====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('hoodies', 'sweatshirts', 'tshirts')),
    category_label_en TEXT NOT NULL,
    category_label_ar TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    original_price NUMERIC(10, 2) CHECK (original_price >= price OR original_price IS NULL),
    gsm INTEGER NOT NULL CHECK (gsm > 0),
    fit_en TEXT NOT NULL,
    fit_ar TEXT NOT NULL,
    fabric_en TEXT NOT NULL,
    fabric_ar TEXT NOT NULL,
    description_en TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    image TEXT NOT NULL,
    hover_image TEXT NOT NULL,
    badge_en TEXT,
    badge_ar TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_coming_soon BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. PRODUCT VARIANTS & INVENTORY TABLE
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    size TEXT NOT NULL, -- 'S', 'M', 'L', 'XL', 'XXL'
    color TEXT NOT NULL, -- 'Onyx Black', 'Bone Ivory', etc.
    sku TEXT UNIQUE NOT NULL,
    inventory_quantity INTEGER NOT NULL DEFAULT 50 CHECK (inventory_quantity >= 0),
    price_override NUMERIC(10, 2) CHECK (price_override >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_product_size_color UNIQUE (product_id, size, color)
);

-- 3. SHIPPING ZONES TABLE
CREATE TABLE IF NOT EXISTS public.shipping_zones (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    countries TEXT[] NOT NULL,
    base_fee NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (base_fee >= 0),
    free_shipping_threshold NUMERIC(10, 2) NOT NULL DEFAULT 500 CHECK (free_shipping_threshold >= 0),
    estimated_days_en TEXT NOT NULL,
    estimated_days_ar TEXT NOT NULL,
    cod_available BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. ORDERS TABLE (Cash On Delivery Focus)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_reference TEXT UNIQUE NOT NULL, -- e.g. ATH-2026-9812
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    shipping_country TEXT NOT NULL,
    shipping_city TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_postal_code TEXT,
    shipping_zone_id TEXT REFERENCES public.shipping_zones(id),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    shipping_fee NUMERIC(10, 2) NOT NULL CHECK (shipping_fee >= 0),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    currency TEXT DEFAULT 'SAR' NOT NULL,
    payment_method TEXT DEFAULT 'cash_on_delivery' NOT NULL,
    payment_status TEXT DEFAULT 'pending_cod' NOT NULL CHECK (payment_status IN ('pending_cod', 'paid_on_delivery', 'pending_verification', 'paid', 'cancelled')),
    order_status TEXT DEFAULT 'confirmed' NOT NULL CHECK (order_status IN ('confirmed', 'processing', 'dispatched', 'delivered', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id),
    variant_id UUID REFERENCES public.product_variants(id),
    product_name_en TEXT NOT NULL,
    product_name_ar TEXT NOT NULL,
    selected_size TEXT NOT NULL,
    selected_color TEXT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. INVENTORY AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.inventory_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    change_amount INTEGER NOT NULL, -- negative for sales, positive for restock
    reason TEXT NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_product_variants_prod_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_ref ON public.orders(order_reference);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;

-- Public can view active products, variants, and shipping zones
CREATE POLICY "Public can read active products" ON public.products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read active variants" ON public.product_variants
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read active shipping zones" ON public.shipping_zones
    FOR SELECT USING (is_active = true);

-- Orders: Server role can insert and read all; customers can read own order by order_reference
CREATE POLICY "Public can read own order by reference" ON public.orders
    FOR SELECT USING (true);

CREATE POLICY "Public can create orders" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can create order items" ON public.order_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can read order items" ON public.order_items
    FOR SELECT USING (true);
-- =====================================================================
-- ATHEER STORE â€” Milestone 2.5 & 3: Egypt Market & Admin Entities
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
    store_name_ar TEXT DEFAULT 'Ø£Ø«ÙŠØ±' NOT NULL,
    tagline_en TEXT DEFAULT 'PREMIUM YOUTH STREETWEAR' NOT NULL,
    tagline_ar TEXT DEFAULT 'Ø£Ø²ÙŠØ§Ø¡ Ø§Ù„Ø´Ø§Ø±Ø¹ Ø§Ù„Ø±Ø§Ù‚ÙŠØ© Ù„Ù„Ø´Ø¨Ø§Ø¨' NOT NULL,
    whatsapp_number TEXT DEFAULT '201000000000' NOT NULL,
    support_email TEXT DEFAULT 'concierge@atheer.store' NOT NULL,
    default_currency TEXT DEFAULT 'EGP' NOT NULL,
    cairo_showrooms_en TEXT DEFAULT 'New Cairo Â· Sheikh Zayed' NOT NULL,
    cairo_showrooms_ar TEXT DEFAULT 'Ø§Ù„Ù‚Ø§Ù‡Ø±Ø© Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø© Â· Ø§Ù„Ø´ÙŠØ® Ø²Ø§ÙŠØ¯' NOT NULL,
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
('cairo-giza', 'Greater Cairo & Giza', 'Ø§Ù„Ù‚Ø§Ù‡Ø±Ø© Ø§Ù„ÙƒØ¨Ø±Ù‰ ÙˆØ§Ù„Ø¬ÙŠØ²Ø©', ARRAY['EG'], ARRAY['Cairo', 'Giza'], 60.00, 1800.00, '1-2 Business Days', 'Ù¡-Ù¢ Ø£ÙŠØ§Ù… Ø¹Ù…Ù„', true, true),
('alex-delta', 'Alexandria & Delta Governorates', 'Ø§Ù„Ø¥Ø³ÙƒÙ†Ø¯Ø±ÙŠØ© ÙˆÙ…Ø­Ø§ÙØ¸Ø§Øª Ø§Ù„Ø¯Ù„ØªØ§', ARRAY['EG'], ARRAY['Alexandria', 'Beheira', 'Gharbia', 'Dakahlia', 'Sharqia', 'Monufia', 'Qalyubia', 'Kafr El Sheikh', 'Damietta'], 75.00, 2000.00, '2-3 Business Days', 'Ù¢-Ù£ Ø£ÙŠØ§Ù… Ø¹Ù…Ù„', true, true),
('canal-cities', 'Canal Zone', 'Ù…Ø¯Ù† Ø§Ù„Ù‚Ù†Ø§Ø©', ARRAY['EG'], ARRAY['Port Said', 'Ismailia', 'Suez'], 85.00, 2200.00, '2-3 Business Days', 'Ù¢-Ù£ Ø£ÙŠØ§Ù… Ø¹Ù…Ù„', true, true),
('upper-egypt', 'Upper Egypt Governorates', 'Ù…Ø­Ø§ÙØ¸Ø§Øª Ø§Ù„ØµØ¹ÙŠØ¯', ARRAY['EG'], ARRAY['Faiyum', 'Beni Suef', 'Minya', 'Asyut', 'Sohag', 'Qena', 'Luxor', 'Aswan'], 95.00, 2500.00, '3-4 Business Days', 'Ù£-Ù¤ Ø£ÙŠØ§Ù… Ø¹Ù…Ù„', true, true),
('coastal-remote', 'Coastal & Frontier Governorates', 'Ø§Ù„Ù…Ø­Ø§ÙØ¸Ø§Øª Ø§Ù„Ø³Ø§Ø­Ù„ÙŠØ© ÙˆØ§Ù„Ø­Ø¯ÙˆØ¯ÙŠØ©', ARRAY['EG'], ARRAY['Red Sea', 'South Sinai', 'North Sinai', 'Matrouh', 'New Valley'], 120.00, 2800.00, '3-5 Business Days', 'Ù£-Ù¥ Ø£ÙŠØ§Ù… Ø¹Ù…Ù„', true, true)
ON CONFLICT (id) DO UPDATE SET
    base_fee = EXCLUDED.base_fee,
    free_shipping_threshold = EXCLUDED.free_shipping_threshold,
    governorates = EXCLUDED.governorates;

-- SEED INITIAL STORE SETTINGS
INSERT INTO public.store_settings (id, store_name_en, store_name_ar, whatsapp_number, default_currency)
VALUES ('main_settings', 'ATHEER', 'Ø£Ø«ÙŠØ±', '201000000000', 'EGP')
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
-- =====================================================================
-- ATHEER STORE â€” Milestone 3.5: Security & RLS Hardening Migration
-- =====================================================================

-- 1. UPDATE ORDERS TABLE SCHEMA FOR EGYPT & STATUS PIPELINE
DO $$
BEGIN
    -- Add governorate column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'governorate'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN governorate TEXT;
    END IF;

    -- Add discount_amount column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'discount_amount'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN discount_amount NUMERIC(10, 2) DEFAULT 0;
    END IF;

    -- Add coupon_code column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'coupon_code'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN coupon_code TEXT;
    END IF;
END $$;

-- Update default currency to EGP
ALTER TABLE public.orders ALTER COLUMN currency SET DEFAULT 'EGP';

-- Update check constraints for order_status and payment_status safely
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_order_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_order_status_check
    CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'));

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_status_check
    CHECK (payment_status IN ('pending_cod', 'paid_on_delivery', 'pending_verification', 'paid', 'cancelled'));

-- 2. HARDEN ROW LEVEL SECURITY (RLS) POLICIES
-- Drop insecure open-read policies that previously allowed public SELECT on customer orders
DROP POLICY IF EXISTS "Public can read own order by reference" ON public.orders;
DROP POLICY IF EXISTS "Public can read order items" ON public.order_items;

-- Orders Table Policies:
-- Only authenticated Administrators can view all customer orders & addresses in Supabase.
-- Service-role server calls bypass RLS securely for order confirmation.
CREATE POLICY "Admins can view all orders" ON public.orders
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update orders" ON public.orders
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "Public checkout can insert orders" ON public.orders
    FOR INSERT WITH CHECK (true);

-- Order Items Table Policies:
CREATE POLICY "Admins can view all order items" ON public.order_items
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Public checkout can insert order items" ON public.order_items
    FOR INSERT WITH CHECK (true);

-- Products & Variants Write Policies:
CREATE POLICY "Admins can insert products" ON public.products
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products" ON public.products
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete products" ON public.products
    FOR DELETE USING (public.is_admin());

CREATE POLICY "Admins can manage variants" ON public.product_variants
    FOR ALL USING (public.is_admin());

-- Coupons Table Policies:
CREATE POLICY "Admins can manage all coupons" ON public.coupons
    FOR ALL USING (public.is_admin());

-- Store Settings Table Policies:
CREATE POLICY "Admins can update store settings" ON public.store_settings
    FOR UPDATE USING (public.is_admin());

-- Shipping Zones Table Policies:
CREATE POLICY "Admins can manage shipping zones" ON public.shipping_zones
    FOR ALL USING (public.is_admin());

-- Inventory Logs Table Policies:
CREATE POLICY "Admins can view inventory logs" ON public.inventory_logs
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert inventory logs" ON public.inventory_logs
    FOR INSERT WITH CHECK (public.is_admin());
-- =====================================================================
-- ATHEER STORE | Ø£Ø«ÙŠØ± â€” Launch Catalog Seed Migration
-- Non-destructive: Uses ON CONFLICT DO NOTHING / UPDATE
-- =====================================================================

-- 1. SEED LAUNCH PRODUCTS (Flagship Hoodies & Sweatshirts)
INSERT INTO public.products (
    id, name_en, name_ar, category, category_label_en, category_label_ar,
    price, original_price, gsm, fit_en, fit_ar, fabric_en, fabric_ar,
    description_en, description_ar, image, hover_image, badge_en, badge_ar,
    is_active, is_coming_soon
) VALUES
(
    'ath-hd-01',
    'The Heavyweight 500 GSM Boxy Hoodie',
    'Ù‡ÙˆØ¯ÙŠ Ø£Ø«ÙŠØ± Ø¨ÙˆÙƒØ³ÙŠ Ø§Ù„Ø«Ù‚ÙŠÙ„ 500 GSM',
    'hoodies',
    'Core Heavyweight Hoodie',
    'Ù‡ÙˆØ¯ÙŠ Ø£Ø³Ø§Ø³ÙŠ ÙØ§Ø¦Ù‚ Ø§Ù„Ø«Ù‚Ù„',
    1450.00,
    1700.00,
    500,
    'Signature Boxy Oversized',
    'Ù‚ØµÙ‘Ø© Ø¨ÙˆÙƒØ³ÙŠ Ø£ÙˆÙØ±Ø³Ø§ÙŠØ² Ù…Ø¹ØªÙ…Ø¯Ø©',
    'Heavyweight Cotton Fleece Blend (500 GSM Spec)',
    'Ù…Ø²ÙŠØ¬ Ù‚Ø·Ù† ØµÙˆÙ Ø«Ù‚ÙŠÙ„ ÙØ§Ø®Ø± (Ù…ÙˆØ§ØµÙØ§Øª 500 GSM)',
    'The defining silhouette of ATHEER. Engineered with dense 500 GSM specification French terry cotton blend, drop-shoulder architecture, and a double-layered structured hood with zero drawstrings for pure minimalist presence.',
    'Ø§Ù„Ù‚Ø·Ø¹Ø© Ø§Ù„Ø£ÙŠÙ‚ÙˆÙ†ÙŠØ© Ù„Ø¯Ø§Ø± Ø£Ø«ÙŠØ±. ØµÙÙ…Ù…Øª Ø¨Ù…ÙˆØ§ØµÙØ§Øª Ù†Ø³ÙŠØ¬ ÙØ±Ù†Ø´ ØªÙŠØ±ÙŠ Ø«Ù‚ÙŠÙ„ 500 GSMØŒ Ø¨Ø£ÙƒØªØ§Ù Ø³Ø§Ù‚Ø·Ø© ÙˆÙ‚ØµÙ‘Ø© Ø¨ÙˆÙƒØ³ÙŠ ÙˆØ§Ø³Ø¹Ø©ØŒ ÙˆØºØ·Ø§Ø¡ Ø±Ø£Ø³ Ù…Ø²Ø¯ÙˆØ¬ Ø¨Ø¯ÙˆÙ† Ø­Ø¨Ø§Ù„ Ù„Ù„Ø­ÙØ§Ø¸ Ø¹Ù„Ù‰ Ø§Ù„Ø·Ø§Ø¨Ø¹ Ø§Ù„Ù…ÙŠÙ†ÙŠÙ…Ø§Ù„ÙŠ Ø§Ù„ÙØ§Ø®Ø±.',
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1000&auto=format&fit=crop',
    'Flagship Drop',
    'Ø§Ù„Ù‚Ø·Ø¹Ø© Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ©',
    true,
    false
),
(
    'ath-hd-02',
    'The Bone Ivory Oversized Hoodie',
    'Ù‡ÙˆØ¯ÙŠ Ø§Ù„Ø¹Ø§Ø¬ÙŠ Ø£ÙˆÙØ±Ø³Ø§ÙŠØ² Ø§Ù„Ù…Ø·Ø±Ø²',
    'hoodies',
    'Core Heavyweight Hoodie',
    'Ù‡ÙˆØ¯ÙŠ Ø£Ø³Ø§Ø³ÙŠ ÙØ§Ø¦Ù‚ Ø§Ù„Ø«Ù‚Ù„',
    1450.00,
    NULL,
    480,
    'Relaxed Drop-Shoulder Fit',
    'Ø£ÙƒØªØ§Ù Ù…Ù†Ø³Ø¯Ù„Ø© ÙˆÙ‚ØµÙ‘Ø© Ù…Ø±ÙŠØ­Ø©',
    'Combed Heavy Cotton Fleece (480 GSM Spec)',
    'Ù‚Ø·Ù† ØµÙˆÙ Ù…Ù…Ø´Ø· Ø«Ù‚ÙŠÙ„ (Ù…ÙˆØ§ØµÙØ§Øª 480 GSM)',
    'Crafted in warm natural bone ivory fleece, featuring subtle tonal matte gold Arabic typography embroidery on the chest nape. Heavyweight 480 GSM specification with ribbed 2x2 cuffs that maintain structural volume.',
    'Ù…Ù†Ø³ÙˆØ¬ Ø¨Ù„ÙˆÙ† Ø§Ù„Ø¹Ø§Ø¬ Ø§Ù„Ø·Ø¨ÙŠØ¹ÙŠ Ø§Ù„Ø¯Ø§ÙØ¦ Ø¨Ù…ÙˆØ§ØµÙØ§Øª 480 GSMØŒ Ù…Ø¹ ØªØ·Ø±ÙŠØ² Ø¯Ù‚ÙŠÙ‚ Ù„Ø´Ø¹Ø§Ø± Ø£Ø«ÙŠØ± Ø¨Ø§Ù„Ø®Ø· Ø§Ù„Ø¹Ø±Ø¨ÙŠ Ø§Ù„Ù…ÙŠÙ†ÙŠÙ…Ø§Ù„ÙŠ Ø¨Ø¯Ø±Ø¬Ø© Ø°Ù‡Ø¨ÙŠØ© Ù…Ø·ÙØ£Ø© Ø®Ù„Ù Ø§Ù„Ø±Ù‚Ø¨Ø©ØŒ ÙˆØ£Ø³Ø§ÙˆØ± Ø¹Ø±ÙŠØ¶Ø© Ù…Ø¶Ù„Ø¹Ø© ØªØ¶Ù…Ù† Ø«Ø¨Ø§Øª Ø§Ù„Ù‚ØµÙ‘Ø© Ø§Ù„Ø£Ù†ÙŠÙ‚Ø©.',
    'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
    'Best Seller',
    'Ø§Ù„Ø£ÙƒØ«Ø± Ø·Ù„Ø¨Ø§Ù‹',
    true,
    false
),
(
    'ath-hd-03',
    'Vintage Washed Charcoal Hoodie',
    'Ù‡ÙˆØ¯ÙŠ Ø§Ù„ÙØ­Ù… Ø§Ù„Ù…ØºØ³ÙˆÙ„ ÙÙŠÙ†ØªØ§Ø¬ 500 GSM',
    'hoodies',
    'Acid Washed Hoodie',
    'Ù‡ÙˆØ¯ÙŠ Ù…ØºØ³ÙˆÙ„ Ø¨Ø§Ù„Ø¥Ù†Ø²ÙŠÙ…',
    1350.00,
    1600.00,
    500,
    'Boxy Street Silhouette',
    'Ù‚ØµÙ‘Ø© Ø¨ÙˆÙƒØ³ÙŠ Ø³ØªØ±ÙŠØª',
    'Enzyme-Washed Heavy French Terry',
    'ÙØ±Ù†Ø´ ØªÙŠØ±ÙŠ Ù…Ø¹Ø§Ù„Ø¬ Ø¨Ø§Ù„ØºØ³ÙŠÙ„ Ø§Ù„Ø¥Ù†Ø²ÙŠÙ…ÙŠ',
    'Individually hand-dyed and enzyme washed for a distressed, lived-in patina. High-density ribbed hem and cuffs with heavy raw-feel 500 GSM fleece.',
    'Ù…Ø¹Ø§Ù„Ø¬ Ø¨ØªÙ‚Ù†ÙŠØ© Ø§Ù„ØºØ³ÙŠÙ„ Ø§Ù„Ø¥Ù†Ø²ÙŠÙ…ÙŠ Ø§Ù„ÙŠØ¯ÙˆÙŠ Ù„Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ù…Ø¸Ù‡Ø± Ø§Ù„ÙÙŠÙ†ØªØ§Ø¬ Ø§Ù„ÙØ§Ø®Ø± ÙˆÙ…Ù„Ù…Ø³ ÙØ±ÙŠØ¯. Ù…ÙˆØ§ØµÙØ§Øª 500 GSM Ù…Ø¹ Ù†Ù‡Ø§ÙŠØ§Øª Ù…Ø¶Ù„Ø¹Ø© Ù…ØªÙ…Ø§Ø³ÙƒØ©.',
    'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop',
    'Limited Wash',
    'Ø¥ØµØ¯Ø§Ø± Ù…Ø­Ø¯ÙˆØ¯',
    true,
    false
),
(
    'ath-hd-04',
    'Subtle Gold Emblem Hoodie',
    'Ù‡ÙˆØ¯ÙŠ Ø§Ù„Ø´Ø¹Ø§Ø± Ø§Ù„Ù…Ø°Ù‡Ø¨ 460 GSM',
    'hoodies',
    'Embroidered Flagship',
    'Ù‡ÙˆØ¯ÙŠ Ø¨Ø§Ù„ØªØ·Ø±ÙŠØ² Ø§Ù„Ø°Ù‡Ø¨ÙŠ',
    1550.00,
    NULL,
    460,
    'Structured Architectural Fit',
    'Ù‚ØµÙ‘Ø© Ù…Ø¹Ù…Ø§Ø±ÙŠØ© Ù…ØªÙ†Ø§Ø³Ù‚Ø©',
    'Luxe Compact Cotton Blend (460 GSM Spec)',
    'Ù…Ø²ÙŠØ¬ Ù‚Ø·Ù† Ù…Ø¯Ù…Ø¬ ÙØ§Ø®Ø± (Ù…ÙˆØ§ØµÙØ§Øª 460 GSM)',
    'Features the iconic ATHEER monogram intricately embroidered with metallic matte gold threads across the chest. Seamless kangaroo pocket and premium brass eyelets.',
    'ÙŠØªÙ…ÙŠØ² Ø¨Ø´Ø¹Ø§Ø± Ø£Ø«ÙŠØ± Ø§Ù„Ø£ÙŠÙ‚ÙˆÙ†ÙŠ Ø§Ù„Ù…Ø·Ø±Ø² Ø¨Ø¯Ù‚Ø© Ø¹Ø§Ù„ÙŠØ© Ø¨Ø®ÙŠÙˆØ· Ø°Ù‡Ø¨ÙŠØ© Ù…Ø·ÙØ£Ø© ØºÙŠØ± Ù„Ø§Ù…Ø¹Ø© Ø¹Ù„Ù‰ Ø§Ù„ØµØ¯Ø±ØŒ Ù…Ø¹ Ø¬ÙŠØ¨ ÙƒÙ†ØºØ± ØºÙŠØ± Ù…Ø±Ø¦ÙŠ ÙˆØªØ´Ø·ÙŠØ¨Ø§Øª Ù…ØªÙ‚Ù†Ø©.',
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=1000&auto=format&fit=crop',
    'Iconic',
    'Ø£ÙŠÙ‚ÙˆÙ†ÙŠ',
    true,
    false
),
(
    'ath-sw-01',
    'Minimalist Crewneck Sweatshirt',
    'Ø³ÙˆÙŠØª Ø´ÙŠØ±Øª ÙƒØ±Ùˆ Ù†ÙŠÙƒ Ù…ÙŠÙ†ÙŠÙ…Ø§Ù„ÙŠ 420 GSM',
    'sweatshirts',
    'Heavyweight Sweatshirt',
    'Ø³ÙˆÙŠØª Ø´ÙŠØ±Øª Ø«Ù‚ÙŠÙ„',
    1150.00,
    1350.00,
    420,
    'Clean Oversized Drop-Shoulder',
    'Ø£ÙˆÙØ±Ø³Ø§ÙŠØ² Ù†Ø¸ÙŠÙ Ø¨Ø£ÙƒØªØ§Ù Ø³Ø§Ù‚Ø·Ø©',
    'Brushed Fleece Interior (420 GSM Spec)',
    'ØµÙˆÙ Ø¯Ø§Ø®Ù„ÙŠ Ù†Ø§Ø¹Ù… Ù…Ù…Ø´Ø· (Ù…ÙˆØ§ØµÙØ§Øª 420 GSM)',
    'A tailored approach to daily streetwear. Ultra-clean collar construction, drop-shoulder seams, and embroidered ATHEER studio coordinates at the lower hem.',
    'ØªØµÙ…ÙŠÙ… Ù…Ø¹Ø§ØµØ± Ù„Ù„Ø£Ù†Ø§Ù‚Ø© Ø§Ù„ÙŠÙˆÙ…ÙŠØ©. ÙŠØ§Ù‚Ø© Ù…ØµÙ…Ù…Ø© Ø¨Ø¯Ù‚Ø© ØªØ­Ø§ÙØ¸ Ø¹Ù„Ù‰ Ø´ÙƒÙ„Ù‡Ø§ØŒ ÙˆØ®ÙŠØ§Ø·Ø© Ø£ÙƒØªØ§Ù Ù…ØªÙ‚Ù†Ø© Ù…Ø¹ Ø¥Ø­Ø¯Ø§Ø«ÙŠØ§Øª Ø³ØªÙˆØ¯ÙŠÙˆ Ø£Ø«ÙŠØ± Ù…Ø·Ø±Ø²Ø© Ø¨Ù†Ø¹ÙˆÙ…Ø© Ø¹Ù†Ø¯ Ø§Ù„Ø­Ø§Ø´ÙŠØ©.',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop',
    'Wardrobe Staple',
    'Ù‚Ø·Ø¹Ø© Ø£Ø³Ø§Ø³ÙŠØ©',
    true,
    false
),
(
    'ath-sw-02',
    'Atelier Raglan Sweatshirt',
    'Ø³ÙˆÙŠØª Ø´ÙŠØ±Øª Ø±Ø§Ø¬Ù„Ø§Ù† Ø³ØªÙˆØ¯ÙŠÙˆ Ø£Ø«ÙŠØ± 450 GSM',
    'sweatshirts',
    'Heavyweight Sweatshirt',
    'Ø³ÙˆÙŠØª Ø´ÙŠØ±Øª Ø«Ù‚ÙŠÙ„',
    1200.00,
    NULL,
    450,
    'Sport-Luxe Raglan Cut',
    'Ù‚ØµÙ‘Ø© Ø±Ø§Ø¬Ù„Ø§Ù† Ø³Ø¨ÙˆØ±Øª-Ù„ÙˆÙƒØ³',
    'Dense Loopback French Terry (450 GSM Spec)',
    'ÙØ±Ù†Ø´ ØªÙŠØ±ÙŠ Ø¨Ø­Ù„Ù‚Ø§Øª Ù…ØªØ±Ø§ØµØ© (Ù…ÙˆØ§ØµÙØ§Øª 450 GSM)',
    'Featuring athletic raglan sleeve ergonomics combined with ultra-dense 450 GSM loopback cotton. Tonal typography silkscreen on the back shoulders.',
    'ÙŠØ¬Ù…Ø¹ Ø¨ÙŠÙ† Ù…Ø±ÙˆÙ†Ø© Ù‚ØµÙ‘Ø© Ø£ÙƒÙ…Ø§Ù… Ø§Ù„Ø±Ø§Ø¬Ù„Ø§Ù† Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ© ÙˆÙØ®Ø§Ù…Ø© Ù†Ø³ÙŠØ¬ Ø§Ù„ÙØ±Ù†Ø´ ØªÙŠØ±ÙŠ ÙØ§Ø¦Ù‚ Ø§Ù„ÙƒØ«Ø§ÙØ©ØŒ Ù…Ø¹ Ø·Ø¨Ø§Ø¹Ø© Ø³ÙŠÙ„Ùƒ Ø³ÙƒØ±ÙŠÙ† Ù‡Ø§Ø¯Ø¦Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø¸Ù‡Ø±.',
    'https://images.unsplash.com/photo-1578587018451-092592758156?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1000&auto=format&fit=crop',
    'Atelier Drop',
    'Ø¥ØµØ¯Ø§Ø± Ø§Ù„Ø£ØªÙŠÙ„ÙŠÙ‡',
    true,
    false
),
(
    'ath-ts-01',
    'Upcoming: Heavyweight Drop-Shoulder Tee 320 GSM',
    'Ù‚Ø±ÙŠØ¨Ø§Ù‹: ØªÙŠ Ø´ÙŠØ±Øª Ø£Ø«ÙŠØ± Ø§Ù„Ø«Ù‚ÙŠÙ„ 320 GSM',
    'tshirts',
    'Next Drop Â· Summer 2026',
    'Ø§Ù„Ø¥ØµØ¯Ø§Ø± Ø§Ù„Ù‚Ø§Ø¯Ù… Â· ØµÙŠÙ Ù¢Ù Ù¢Ù¦',
    750.00,
    NULL,
    320,
    'Boxy Oversized Tee',
    'ØªÙŠ Ø´ÙŠØ±Øª Ø¨ÙˆÙƒØ³ÙŠ Ø£ÙˆÙØ±Ø³Ø§ÙŠØ²',
    'Single Jersey Combed Cotton (320 GSM Spec)',
    'Ù‚Ø·Ù† Ø³Ù†Ø¬Ù„ Ø¬ÙŠØ±Ø³ÙŠ Ù…Ù…Ø´Ø· (Ù…ÙˆØ§ØµÙØ§Øª 320 GSM)',
    'The foundation of our upcoming summer delivery. Unrivaled 320 GSM jersey density, thick 1.25" rib collar that will not sag, and signature boxy proportions.',
    'Ø£Ø³Ø§Ø³ ØªØ´ÙƒÙŠÙ„Ø© Ø§Ù„ØµÙŠÙ Ø§Ù„Ù‚Ø§Ø¯Ù…Ø©. ÙƒØ«Ø§ÙØ© Ø¬ÙŠØ±Ø³ÙŠ Ø§Ø³ØªØ«Ù†Ø§Ø¦ÙŠØ© 320 GSM Ù…Ø¹ ÙŠØ§Ù‚Ø© Ù…Ø¶Ù„Ø¹Ø© Ø¹Ø±ÙŠØ¶Ø© ØªØ­ØªÙØ¸ Ø¨ØµÙ„Ø§Ø¨ØªÙ‡Ø§ ÙˆÙ‚ØµÙ‘Ø© Ø¨ÙˆÙƒØ³ÙŠ ÙˆØ§Ø³Ø¹Ø©.',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop',
    'Coming Soon',
    'Ù‚Ø±ÙŠØ¨Ø§Ù‹',
    true,
    true
)
ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    gsm = EXCLUDED.gsm,
    is_coming_soon = EXCLUDED.is_coming_soon,
    is_active = EXCLUDED.is_active;

-- 2. SEED VARIANTS & INITIAL STOCK
INSERT INTO public.product_variants (product_id, size, color, sku, inventory_quantity)
VALUES
('ath-hd-01', 'S', 'Onyx Black', 'ATH-HD01-BLK-S', 25),
('ath-hd-01', 'M', 'Onyx Black', 'ATH-HD01-BLK-M', 35),
('ath-hd-01', 'L', 'Onyx Black', 'ATH-HD01-BLK-L', 45),
('ath-hd-01', 'XL', 'Onyx Black', 'ATH-HD01-BLK-XL', 25),
('ath-hd-01', 'XXL', 'Onyx Black', 'ATH-HD01-BLK-XXL', 15),
('ath-hd-02', 'S', 'Bone Ivory', 'ATH-HD02-IVR-S', 20),
('ath-hd-02', 'M', 'Bone Ivory', 'ATH-HD02-IVR-M', 30),
('ath-hd-02', 'L', 'Bone Ivory', 'ATH-HD02-IVR-L', 25),
('ath-hd-02', 'XL', 'Bone Ivory', 'ATH-HD02-IVR-XL', 15),
('ath-hd-03', 'M', 'Washed Charcoal', 'ATH-HD03-CHR-M', 20),
('ath-hd-03', 'L', 'Washed Charcoal', 'ATH-HD03-CHR-L', 25),
('ath-hd-03', 'XL', 'Washed Charcoal', 'ATH-HD03-CHR-XL', 15),
('ath-hd-04', 'S', 'Onyx Black', 'ATH-HD04-BLK-S', 15),
('ath-hd-04', 'M', 'Onyx Black', 'ATH-HD04-BLK-M', 25),
('ath-hd-04', 'L', 'Onyx Black', 'ATH-HD04-BLK-L', 25),
('ath-hd-04', 'XL', 'Onyx Black', 'ATH-HD04-BLK-XL', 15),
('ath-sw-01', 'S', 'Heather Slate', 'ATH-SW01-SLT-S', 20),
('ath-sw-01', 'M', 'Heather Slate', 'ATH-SW01-SLT-M', 35),
('ath-sw-01', 'L', 'Heather Slate', 'ATH-SW01-SLT-L', 35),
('ath-sw-01', 'XL', 'Heather Slate', 'ATH-SW01-SLT-XL', 20),
('ath-sw-02', 'M', 'Bone Ivory', 'ATH-SW02-IVR-M', 25),
('ath-sw-02', 'L', 'Bone Ivory', 'ATH-SW02-IVR-L', 30),
('ath-sw-02', 'XL', 'Bone Ivory', 'ATH-SW02-IVR-XL', 20)
ON CONFLICT (sku) DO UPDATE SET
    inventory_quantity = EXCLUDED.inventory_quantity;
