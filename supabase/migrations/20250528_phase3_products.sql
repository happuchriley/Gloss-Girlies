-- Phase 3: Product enhancements (featured, image gallery)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_name_search ON public.products USING gin (to_tsvector('english', name || ' ' || brand || ' ' || description));
