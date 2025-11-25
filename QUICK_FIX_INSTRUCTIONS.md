# 🚨 URGENT: Fix Infinite Recursion Error

## The Problem
You're getting this error:
```
infinite recursion detected in policy for relation "users"
```

This is blocking all database operations.

## ⚡ Quick Fix (5 minutes)

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: `hddiuzsxrgneysrnzgcb`
3. Click **SQL Editor** in the left sidebar

### Step 2: Run the Fix Script
1. Click **New Query**
2. Open the file: `supabase/fix-rls-policies.sql`
3. **Copy the ENTIRE contents** of that file
4. **Paste it into the SQL Editor**
5. Click **Run** (or press Ctrl+Enter)

### Step 3: Verify It Worked
After running, you should see:
- ✅ "Success. No rows returned"
- ✅ No error messages

### Step 4: Disable Email Confirmation (Optional)
1. Go to **Authentication** > **Providers** > **Email**
2. Turn OFF **"Confirm email"** toggle
3. Click **Save**

This allows users to login immediately without email confirmation.

### Step 5: Test
1. **Hard refresh your browser**: `Ctrl + Shift + R`
2. Try to register a new user
3. Try to login

## What the Fix Does

The fix script:
1. ✅ Drops all problematic RLS policies
2. ✅ Creates `is_admin()` function that bypasses RLS
3. ✅ Recreates all policies using the safe function
4. ✅ Fixes infinite recursion for all tables

## If You Get Errors Running the Script

### Error: "policy does not exist"
- This is OK! The script uses `DROP POLICY IF EXISTS`
- Just continue - it means some policies weren't there

### Error: "function already exists"
- This is OK! The script uses `CREATE OR REPLACE`
- The function will be updated

### Error: "permission denied"
- Make sure you're logged into Supabase dashboard
- Make sure you're in the correct project

## Still Having Issues?

1. **Check Supabase Logs**:
   - Go to **Logs** > **Postgres Logs**
   - Look for detailed error messages

2. **Verify Policies**:
   - Go to **Database** > **Policies**
   - Check that policies exist for `users` table

3. **Try Manual Fix**:
   - Go to **Database** > **Policies**
   - Delete all policies on `users` table
   - Then run the fix script again

## After Fixing

You should see:
- ✅ No more "infinite recursion" errors
- ✅ Users can register successfully
- ✅ Users can login successfully
- ✅ Products load without 500 errors

---

**IMPORTANT**: You MUST run the fix script in Supabase SQL Editor. The error won't go away until you do this!

