-- =====================================================================
-- ATHEER STORE — Milestone 3.5: Security & RLS Hardening Migration
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
    CHECK (payment_status IN ('pending_cod', 'paid_on_delivery', 'cancelled'));

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
