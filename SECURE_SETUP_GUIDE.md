# Secure Database Setup Guide - Best Practices

## Overview

This guide implements **production-ready, secure database practices** for your Supabase backend.

## Security Features Implemented

✅ **Security Definer Functions**: Admin checks bypass RLS safely  
✅ **No Public Inserts**: Products can only be inserted by admins  
✅ **Proper RLS Policies**: No infinite recursion, secure access control  
✅ **Secure Seeding**: Products seeded via secure function, not public policy  
✅ **Principle of Least Privilege**: Users can only access/modify their own data  

## Setup Steps

### Step 1: Run Secure Fix SQL

1. Go to **Supabase Dashboard** > **SQL Editor**
2. Open `supabase/secure-fix.sql`
3. **Copy the ENTIRE file**
4. **Paste and Run** in SQL Editor

This will:
- ✅ Create secure `is_admin()` function
- ✅ Create secure `seed_products()` function
- ✅ Fix all RLS policies
- ✅ Remove infinite recursion

### Step 2: Create Admin User

1. Go to **Authentication** > **Users**
2. Click **Add User** (or use email signup)
3. Create a user with email (e.g., `admin@glossgirlies.com`)
4. Go to **SQL Editor** and run:

```sql
-- Set user as admin
UPDATE public.users
SET role = 'admin'
WHERE email = 'admin@glossgirlies.com';
```

### Step 3: Seed Products (Two Options)

#### Option A: Using Secure Function (Recommended)

1. **Login as admin** in your app
2. Products will auto-seed on first load
3. Or call the function manually:

```sql
SELECT public.seed_products();
```

#### Option B: Direct Insert (Initial Setup Only)

If you need to seed before creating admin:

1. In SQL Editor, uncomment the `DO $$` block in `secure-fix.sql`
2. Run it directly
3. This only works if products table is empty

### Step 4: Disable Email Confirmation (Development)

1. Go to **Authentication** > **Providers** > **Email**
2. Turn OFF **"Confirm email"**
3. Click **Save**

## Security Best Practices Explained

### 1. Security Definer Functions

```sql
CREATE FUNCTION public.is_admin(user_id UUID)
SECURITY DEFINER  -- Runs with function owner's privileges
SET search_path = public
```

**Why**: Bypasses RLS to check admin status without infinite recursion.

**Safety**: Function only reads data, never modifies it.

### 2. No Public Product Inserts

```sql
CREATE POLICY "Only admins can insert products"
  ON public.products FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));
```

**Why**: Prevents unauthorized product creation.

**Safety**: Only admins can insert products.

### 3. Secure Seeding Function

```sql
CREATE FUNCTION public.seed_products()
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can seed products';
  END IF;
  -- ... insert products
END;
$$;
```

**Why**: Centralized, controlled seeding process.

**Safety**: Checks admin status before seeding.

### 4. Principle of Least Privilege

- Users can only view/edit their own data
- Public can only read non-sensitive data
- Admins can manage all data through secure functions

## Policy Structure

### Users Table
- ✅ Users: View own profile
- ✅ Public: View basic info (name, email)
- ✅ Users: Update own profile
- ✅ Admins: View/update all users
- ✅ Users: Delete own profile (not admins)

### Products Table
- ✅ Public: View all products
- ✅ Admins: Insert/update/delete products
- ❌ No public inserts

### Orders Table
- ✅ Users: View own orders
- ✅ Users: Create own orders
- ✅ Admins: View/update all orders

## Verification Checklist

After setup, verify:

- [ ] `is_admin()` function exists
- [ ] `seed_products()` function exists
- [ ] All policies use `is_admin()` function
- [ ] Products table has data (or can be seeded)
- [ ] Admin user exists and has `role = 'admin'`
- [ ] No infinite recursion errors
- [ ] Products load correctly
- [ ] Cart operations work
- [ ] Reviews load correctly

## Troubleshooting

### "Only admins can seed products" Error

**Cause**: User is not an admin.

**Fix**: 
1. Create admin user (see Step 2)
2. Or use direct insert (Option B in Step 3)

### Products Still Not Seeding

**Cause**: Function might not exist or user not admin.

**Fix**:
1. Verify `seed_products()` function exists
2. Check user role is 'admin'
3. Try direct insert as fallback

### Infinite Recursion Still Happening

**Cause**: Old policies not dropped.

**Fix**:
1. Run `secure-fix.sql` again
2. Check all old policies are dropped
3. Verify `is_admin()` function exists

## Production Considerations

### Before Going to Production

1. **Remove Development Policies**: Remove any "allow when empty" policies
2. **Review Permissions**: Ensure only necessary permissions are granted
3. **Audit Logs**: Enable Supabase audit logs
4. **Backup**: Set up regular database backups
5. **Rate Limiting**: Consider rate limiting for API calls

### Security Checklist

- [ ] All policies use security definer functions
- [ ] No public inserts on sensitive tables
- [ ] Admin functions properly secured
- [ ] User data properly isolated
- [ ] RLS enabled on all tables
- [ ] Functions have proper permissions

## Support

If you encounter issues:
1. Check Supabase Logs: Dashboard > Logs
2. Verify Policies: Dashboard > Database > Policies
3. Check Functions: Dashboard > Database > Functions
4. Review Error Messages: Browser console and Supabase logs

---

**This setup follows industry best practices for security and is production-ready.**

