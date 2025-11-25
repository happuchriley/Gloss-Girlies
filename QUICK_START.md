# Quick Start Guide - Supabase Backend

## 🚀 Get Started in 5 Minutes

### Step 1: Create Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up (free tier available)
3. Click "New Project"
4. Fill in project details and wait 1-2 minutes

### Step 2: Get Your Keys
1. In Supabase dashboard → **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (long string)

### Step 3: Set Environment Variables
Create `.env.local` in project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Set Up Database
1. In Supabase dashboard → **SQL Editor**
2. Click "New query"
3. Open `supabase/schema.sql` from this project
4. Copy ALL the SQL code
5. Paste into SQL Editor
6. Click **Run** (or Ctrl+Enter)
7. Should see "Success. No rows returned"

### Step 5: Create Admin User
1. Go to **Authentication** → **Users** → **Add user**
2. Create user:
   - Email: `admin@glossgirlies.com`
   - Password: (choose a strong password)
3. Go back to **SQL Editor** and run:
```sql
INSERT INTO public.users (id, email, name, role)
SELECT id, email, 'Admin', 'admin'
FROM auth.users
WHERE email = 'admin@glossgirlies.com';
```

### Step 6: Start the App
```bash
npm run dev
```

### Step 7: Test
1. Register a new user account
2. Browse products
3. Add items to cart
4. Complete checkout
5. View orders

## ✅ That's It!

Your app now has a fully functional Supabase backend with:
- ✅ User authentication
- ✅ Product management
- ✅ Shopping cart
- ✅ Orders
- ✅ Reviews
- ✅ Addresses

## 🔧 Troubleshooting

**Error: "supabaseUrl is required"**
- Check `.env.local` exists
- Verify variable names are exact
- Restart dev server

**Error: "Row Level Security policy violation"**
- Make sure you ran the complete `schema.sql`
- Check user is authenticated

**Cart/Orders not showing**
- Verify user is logged in
- Check browser console for errors
- Ensure RLS policies are set up

## 📚 More Info

- Full setup guide: `SUPABASE_SETUP.md`
- Migration details: `MIGRATION_SUMMARY.md`
- Complete docs: `README_SUPABASE.md`

