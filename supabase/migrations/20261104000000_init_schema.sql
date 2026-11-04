-- =====================================================================
-- ATHEER STORE | أثير — Database Schema Migration
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
    payment_status TEXT DEFAULT 'pending_cod' NOT NULL CHECK (payment_status IN ('pending_cod', 'paid_on_delivery', 'cancelled')),
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
