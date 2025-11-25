-- ============================================
-- COMPLETE FIX FOR ALL DATABASE ISSUES
-- ============================================
-- Run this ENTIRE file in Supabase SQL Editor
-- This fixes: RLS infinite recursion, products seeding, and all policies
-- ============================================

-- Step 1: Drop all existing problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Allow public read access to users" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to update their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own profile" ON public.users;
DROP POLICY IF EXISTS "Public can view basic user info" ON public.users;
DROP POLICY IF EXISTS "Admins can update any user" ON public.users;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.users;
DROP POLICY IF EXISTS "Only admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Only admins can update products" ON public.products;
DROP POLICY IF EXISTS "Only admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Allow admin to insert products" ON public.products;
DROP POLICY IF EXISTS "Allow admin to update products" ON public.products;
DROP POLICY IF EXISTS "Allow admin to delete products" ON public.products;
DROP POLICY IF EXISTS "Allow initial product seeding" ON public.products;

-- Step 2: Create security definer function to check admin role
-- This bypasses RLS to prevent infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  -- This function runs with the privileges of the function owner (postgres)
  -- and bypasses RLS, preventing infinite recursion
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id AND role = 'admin'
  );
END;
$$;

-- Step 3: Create fixed users policies
-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Allow public read access to basic user info (for displaying names, etc.)
CREATE POLICY "Public can view basic user info"
  ON public.users FOR SELECT
  USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow admins to view all users (using security definer function)
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Allow admins to update any user
CREATE POLICY "Admins can update any user"
  ON public.users FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Allow users to delete their own profile (but not admins)
CREATE POLICY "Users can delete their own profile"
  ON public.users FOR DELETE
  USING (
    auth.uid() = id AND
    NOT public.is_admin(auth.uid())
  );

-- Step 4: Create fixed products policies
-- Products: public read, admin write, allow seeding when empty
CREATE POLICY "Only admins can insert products"
  ON public.products FOR INSERT
  WITH CHECK (
    public.is_admin(auth.uid())
    OR
    -- Allow initial seeding when table is empty (development only)
    (SELECT COUNT(*) FROM public.products) = 0
  );

CREATE POLICY "Only admins can update products"
  ON public.products FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete products"
  ON public.products FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Step 5: Fix orders policies
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
DROP POLICY IF EXISTS "Allow admin to update any order" ON public.orders;

CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all orders"
  ON public.orders FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Step 6: Fix order items policies
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;

CREATE POLICY "Admins can view all order items"
  ON public.order_items FOR SELECT
  USING (public.is_admin(auth.uid()));

-- ============================================
-- SEED PRODUCTS (Optional - run if products table is empty)
-- ============================================
-- Uncomment and run this section to seed initial products:

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
-- 1. Infinite recursion error should be fixed
-- 2. Products can be seeded when table is empty
-- 3. All policies use security definer functions
-- 4. Optionally seed products using the INSERT statement above

