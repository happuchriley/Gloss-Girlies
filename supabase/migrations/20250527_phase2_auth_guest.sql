-- Phase 2: Authentication, guest checkout, wishlist, payments scaffold
-- Run in Supabase SQL Editor after complete-schema.sql

-- ─── Helper: admin check (avoids RLS recursion) ───────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ─── Users profile extensions ───────────────────────────────────────────────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS marketing_opt_in BOOLEAN DEFAULT FALSE;

-- ─── Orders: guest checkout support ─────────────────────────────────────────
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS is_guest BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS guest_email TEXT,
  ADD COLUMN IF NOT EXISTS guest_phone TEXT,
  ADD COLUMN IF NOT EXISTS guest_access_token TEXT,
  ADD COLUMN IF NOT EXISTS guest_name TEXT;

ALTER TABLE public.orders
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_guest_or_user_check CHECK (
    (is_guest = FALSE AND user_id IS NOT NULL)
    OR (is_guest = TRUE AND user_id IS NULL AND guest_email IS NOT NULL AND guest_access_token IS NOT NULL)
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_guest_access_token
  ON public.orders (guest_access_token)
  WHERE guest_access_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_guest_email
  ON public.orders (guest_email)
  WHERE guest_email IS NOT NULL;

-- ─── Wishlist (Phase 3 ready) ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.wishlist(user_id);

-- ─── Payments scaffold (Paystack Phase 4) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'paystack',
  reference TEXT UNIQUE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'GHS',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'success', 'failed', 'abandoned')),
  metadata JSONB DEFAULT '{}',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON public.payments(reference);

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Guest order tracking RPC (email + token) ───────────────────────────────
CREATE OR REPLACE FUNCTION public.track_guest_order(
  p_order_id TEXT,
  p_email TEXT,
  p_access_token TEXT
)
RETURNS SETOF public.orders
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.orders
  WHERE id = p_order_id
    AND is_guest = TRUE
    AND lower(guest_email) = lower(trim(p_email))
    AND guest_access_token = p_access_token
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.track_guest_order(TEXT, TEXT, TEXT) TO anon, authenticated;

-- ─── RLS: wishlist ───────────────────────────────────────────────────────────
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own wishlist"
  ON public.wishlist FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── RLS: payments ───────────────────────────────────────────────────────────
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own order payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = payments.order_id
        AND (o.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Admins manage all payments"
  ON public.payments FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── RLS: orders — guest + tracking updates ───────────────────────────────────
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Registered users insert own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_guest = FALSE);

CREATE POLICY "Guests insert guest orders"
  ON public.orders FOR INSERT
  WITH CHECK (
    is_guest = TRUE
    AND user_id IS NULL
    AND guest_email IS NOT NULL
    AND guest_access_token IS NOT NULL
  );

-- Order items: allow insert for guest orders owned by matching token via order
DROP POLICY IF EXISTS "Users can insert their own order items" ON public.order_items;

CREATE POLICY "Users insert order items for own orders"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id
        AND (
          (o.user_id = auth.uid() AND o.is_guest = FALSE)
          OR (o.is_guest = TRUE AND o.user_id IS NULL)
        )
    )
  );

-- Sync email verified from auth (optional trigger)
CREATE OR REPLACE FUNCTION public.sync_user_email_verified()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET email_verified_at = CASE
    WHEN NEW.email_confirmed_at IS NOT NULL THEN NEW.email_confirmed_at
    ELSE NULL
  END
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_email_verified ON auth.users;
CREATE TRIGGER on_auth_user_email_verified
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_email_verified();
