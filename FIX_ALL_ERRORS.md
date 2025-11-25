# Fix All Database Errors - Complete Guide

## Current Errors

1. ❌ **Products RLS Error**: `new row violates row-level security policy for table "products"`
2. ❌ **Cart Foreign Key Error**: `Key is not present in table "products"`
3. ❌ **Reviews Query Error**: `Could not find a relationship between 'reviews' and 'user_id'`
4. ❌ **Cart 406 Error**: `406 (Not Acceptable)`

## Quick Fix (Run This First!)

### Step 1: Run Complete Fix SQL

1. Go to **Supabase Dashboard** > **SQL Editor**
2. Open `supabase/complete-fix.sql`
3. **Copy the ENTIRE file** (everything between the comment markers)
4. **Paste into SQL Editor**
5. Click **Run**

This will:
- ✅ Fix infinite recursion in RLS policies
- ✅ Allow products to be seeded when table is empty
- ✅ Fix all admin policies
- ✅ Fix orders and order_items policies

### Step 2: Seed Products (Optional)

After running the fix, if products table is still empty, you can seed it:

1. In SQL Editor, uncomment the `INSERT INTO public.products` section in `supabase/complete-fix.sql`
2. Or run this directly:

```sql
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
```

### Step 3: Disable Email Confirmation

1. Go to **Authentication** > **Providers** > **Email**
2. Turn OFF **"Confirm email"**
3. Click **Save**

### Step 4: Clear Browser Cache

- Press `Ctrl + Shift + R` to hard refresh
- Try the app again

## What I Fixed in Code

### 1. Reviews Query (`store/reviewStore.ts`)
- ❌ **Before**: `users:user_id(name)` - Invalid PostgREST syntax
- ✅ **After**: Fetch reviews first, then fetch user names separately

### 2. Cart Query (`store/cartStore.ts`)
- ❌ **Before**: `.select('id, quantity').single()` - Caused 406 errors
- ✅ **After**: `.select('*').maybeSingle()` - Handles missing items gracefully

### 3. Products Seeding
- ✅ Added policy to allow seeding when products table is empty
- ✅ Products will auto-seed on first load if table is empty

## Expected Results

After applying fixes:
- ✅ No more "infinite recursion" errors
- ✅ Products can be seeded successfully
- ✅ Products load and display correctly
- ✅ Cart operations work (add to cart, remove, etc.)
- ✅ Reviews load with user names
- ✅ No 406 or 403 errors

## Verification

1. **Check Products**: Go to homepage - products should display
2. **Check Cart**: Add item to cart - should work without errors
3. **Check Reviews**: Go to product page - reviews should load
4. **Check Console**: No more RLS or foreign key errors

## If Issues Persist

1. **Check Supabase Logs**: Dashboard > Logs > Postgres Logs
2. **Verify Policies**: Dashboard > Database > Policies
3. **Check Tables**: Dashboard > Table Editor - verify products exist
4. **Verify Functions**: Dashboard > Database > Functions - `is_admin` should exist

---

**IMPORTANT**: You MUST run `supabase/complete-fix.sql` in Supabase SQL Editor for the fixes to work!

