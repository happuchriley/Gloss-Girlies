-- ============================================
-- FIX PRODUCTS SEEDING - Allow Initial Product Insertion
-- ============================================
-- This allows products to be seeded when the database is empty
-- Run this AFTER running fix-rls-policies.sql
-- ============================================

-- Option 1: Allow service role to insert products (recommended)
-- This is already handled by the admin policy, but we need to ensure
-- the is_admin function works correctly

-- Option 2: Create a function to seed products that bypasses RLS
CREATE OR REPLACE FUNCTION public.seed_products()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function can insert products without RLS restrictions
  -- It should only be called by admins or during initial setup
  -- Products will be inserted via the application
END;
$$;

-- Option 3: Temporarily allow inserts if table is empty (for development only)
-- Add a policy that allows inserts when products table is empty
-- This is a one-time seeding policy

-- Drop existing insert policy if it exists
DROP POLICY IF EXISTS "Allow initial product seeding" ON public.products;

-- Create a policy that allows inserts when table is empty
-- WARNING: This is less secure, use only for development
CREATE POLICY "Allow initial product seeding"
  ON public.products FOR INSERT
  WITH CHECK (
    -- Allow if user is admin
    public.is_admin(auth.uid())
    OR
    -- OR if products table is empty (one-time seeding)
    (SELECT COUNT(*) FROM public.products) = 0
  );

-- ============================================
-- ALTERNATIVE: Seed products directly via SQL
-- ============================================
-- If the above doesn't work, you can seed products directly:

/*
INSERT INTO public.products (id, name, brand, price, image, category, description, stock, sku)
VALUES
  ('1', 'Salicylic Acid Face Wash', 'DermDoc', 299.00, 'https://media6.ppl-media.com/tr:w-300,c-at_max,pr-true,dpr-2/mediafiles/ecomm/misc/1710759626_skincare.jpg', 'Skincare', 'Deep cleansing face wash with salicylic acid', 100, 'SKU-000001'),
  ('2', 'Matte Foundation', 'Lakme', 499.00, 'https://media6.ppl-media.com/tr:w-300,c-at_max,pr-true,dpr-2/mediafiles/ecomm/misc/1710759624_makeup.jpg', 'Makeup', 'Long-lasting matte finish foundation', 100, 'SKU-000002'),
  ('3', 'Hydrating Hair Serum', 'L''Oreal Paris', 399.00, 'https://media6.ppl-media.com/tr:w-300,c-at_max,pr-true,dpr-2/mediafiles/ecomm/misc/1710759622_haircare.jpg', 'Haircare', 'Intensive hydration for dry and damaged hair', 100, 'SKU-000003'),
  ('4', 'CICA Sunscreen SPF 50', 'Good Vibes', 349.00, 'https://media6.ppl-media.com/tr:w-300,c-at_max,pr-true,dpr-2/mediafiles/ecomm/misc/1710759626_skincare.jpg', 'Skincare', 'Broad spectrum protection with CICA extract', 100, 'SKU-000004'),
  ('5', 'Rosemary Hair Spray', 'Alps Goodness', 249.00, 'https://media6.ppl-media.com/tr:w-300,c-at_max,pr-true,dpr-2/mediafiles/ecomm/misc/1710759622_haircare.jpg', 'Haircare', 'Strengthening hair spray with rosemary extract', 100, 'SKU-000005'),
  ('6', 'Winter Hydration Cream', 'Foxtale', 449.00, 'https://media6.ppl-media.com/tr:w-300,c-at_max,pr-true,dpr-2/mediafiles/ecomm/misc/1710759626_skincare.jpg', 'Skincare', 'Intensive moisturizing cream for winter', 100, 'SKU-000006'),
  ('7', 'Vitamin C Serum', 'The Ordinary', 599.00, 'https://media6.ppl-media.com/tr:w-300,c-at_max,pr-true,dpr-2/mediafiles/ecomm/misc/1710759626_skincare.jpg', 'Skincare', 'Brightening serum with vitamin C', 100, 'SKU-000007')
ON CONFLICT (id) DO NOTHING;
*/

-- ============================================
-- FIX COMPLETE
-- ============================================
-- After running this:
-- 1. Products can be seeded when table is empty
-- 2. Or seed products directly using the INSERT statement above
-- 3. After seeding, you can remove the "Allow initial product seeding" policy
--    if you want stricter security

