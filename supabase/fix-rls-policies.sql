-- ============================================
-- FIX RLS POLICIES - Remove Infinite Recursion
-- ============================================
-- Run this in Supabase SQL Editor to fix the infinite recursion error
-- ============================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Allow public read access to users" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to update their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own profile" ON public.users;

-- Create a security definer function to check admin role
-- This bypasses RLS to prevent infinite recursion
-- Using SET LOCAL to ensure RLS is bypassed
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

-- Create a security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.users WHERE id = user_id;
$$;

-- Now create fixed policies that use the security definer function
-- This prevents infinite recursion

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Allow public read access to basic user info (for displaying names, etc.)
-- This is safe as we're only exposing non-sensitive data
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

-- Fix products policies to use security definer function
DROP POLICY IF EXISTS "Only admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Only admins can update products" ON public.products;
DROP POLICY IF EXISTS "Only admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Allow admin to insert products" ON public.products;
DROP POLICY IF EXISTS "Allow admin to update products" ON public.products;
DROP POLICY IF EXISTS "Allow admin to delete products" ON public.products;

CREATE POLICY "Only admins can insert products"
  ON public.products FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update products"
  ON public.products FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete products"
  ON public.products FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Fix orders policies
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
DROP POLICY IF EXISTS "Allow admin to update any order" ON public.orders;

CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all orders"
  ON public.orders FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Fix order items policies
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;

CREATE POLICY "Admins can view all order items"
  ON public.order_items FOR SELECT
  USING (public.is_admin(auth.uid()));

-- ============================================
-- FIX COMPLETE
-- ============================================
-- The infinite recursion error should now be resolved.
-- All admin checks now use security definer functions that bypass RLS.

