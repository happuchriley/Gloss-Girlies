-- Inventory tracking: flag on orders + movement log
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS inventory_adjusted BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
  change_amount INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL CHECK (quantity_after >= 0),
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_product
  ON public.inventory_movements(product_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_order
  ON public.inventory_movements(order_id);
