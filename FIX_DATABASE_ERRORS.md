# Fix Database Errors

## Current Issues

1. ✅ **Supabase Connection**: Working (URL loads successfully)
2. ❌ **Infinite Recursion in RLS**: `infinite recursion detected in policy for relation "users"`
3. ❌ **Products 500 Error**: Products table query failing
4. ❌ **Email Confirmation**: Users need to confirm email before login

## Quick Fix Steps

### Step 1: Fix RLS Policies (Infinite Recursion)

The RLS policies are causing infinite recursion because they query `public.users` to check admin status, but those queries themselves trigger the same policies.

**Solution:** Run the fix script in Supabase SQL Editor:

1. Go to your Supabase Dashboard
2. Open **SQL Editor**
3. Copy and paste the contents of `supabase/fix-rls-policies.sql`
4. Click **Run**

This will:
- Create security definer functions to check admin status (bypasses RLS)
- Fix all policies to use these functions instead of direct queries
- Remove duplicate policies

### Step 2: Disable Email Confirmation (For Development)

By default, Supabase requires email confirmation. For development, you can disable it:

1. Go to **Authentication** > **Providers** > **Email**
2. Disable **"Confirm email"** toggle
3. Save

**OR** keep it enabled and handle email confirmation in your app.

### Step 3: Verify Products Table

Make sure the products table exists and has data:

1. Go to **Table Editor** > **products**
2. Check if the table exists
3. If empty, you may need to seed it with initial data

## Error Details

### Error 1: Infinite Recursion
```
Error: infinite recursion detected in policy for relation "users"
```

**Cause:** Policies query `public.users` to check admin, but those queries trigger the same policies.

**Fix:** Use security definer functions (see Step 1)

### Error 2: Products 500 Error
```
Failed to load resource: 500 (Internal Server Error)
```

**Cause:** Could be:
- Products table doesn't exist
- RLS policies blocking access
- Missing columns

**Fix:** 
1. Run the schema fix (Step 1)
2. Check if products table exists
3. Verify RLS is enabled and policies are correct

### Error 3: Email Not Confirmed
```
Login error: Email not confirmed
```

**Cause:** Supabase requires email confirmation by default.

**Fix:** 
- Disable email confirmation in Supabase dashboard (for development)
- OR implement email confirmation flow in your app

## After Running Fixes

1. **Clear browser cache** (Ctrl + Shift + R)
2. **Try logging in again**
3. **Check browser console** for any remaining errors

## Verification

After applying fixes, you should see:
- ✅ No more "infinite recursion" errors
- ✅ Products load successfully
- ✅ Users can register and login
- ✅ No 500 errors on API calls

## If Issues Persist

1. Check Supabase Dashboard > **Logs** for detailed error messages
2. Verify all tables exist in **Table Editor**
3. Check **Authentication** > **Users** to see if users are being created
4. Review **Database** > **Policies** to ensure policies are correct

