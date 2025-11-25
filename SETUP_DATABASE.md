# Database Setup Guide

## Step 1: Verify Your Supabase Project

Your Supabase project reference is: `hddiuzsxrgneysrnzgbc`

Your Supabase URL should be:
```
https://hddiuzsxrgneysrnzgbc.supabase.co
```

Make sure your `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=https://hddiuzsxrgneysrnzgbc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkZGl1enN4cmduZXlzcm56Z2NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NTcyMDksImV4cCI6MjA3OTIzMzIwOX0.KMku5zDz7Xq6eSyi_6ctOiETIphz_Dfv5rP68Eu4iN4
```

## Step 2: Access Your Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Log in to your account
3. Find your project (reference: `hddiuzsxrgneysrnzgbc`)
4. Click on it to open the dashboard

## Step 3: Run the Database Schema

1. In your Supabase dashboard, click on **"SQL Editor"** in the left sidebar
2. Click **"New query"** button
3. Open the file `supabase/schema.sql` from this project
4. **Copy ALL the contents** of `supabase/schema.sql`
5. **Paste** it into the SQL Editor
6. Click **"Run"** (or press Ctrl+Enter / Cmd+Enter)
7. You should see: **"Success. No rows returned"**

## Step 4: Verify Tables Were Created

1. In Supabase dashboard, go to **"Table Editor"** in the left sidebar
2. You should see these tables:
   - ✅ `users`
   - ✅ `products`
   - ✅ `cart_items`
   - ✅ `orders`
   - ✅ `order_items`
   - ✅ `addresses`
   - ✅ `reviews`

## Step 5: Create Admin User

1. Go to **"Authentication"** → **"Users"** in the left sidebar
2. Click **"Add user"** → **"Create new user"**
3. Enter:
   - **Email**: `admin@glossgirlies.com`
   - **Password**: (choose a strong password)
   - **Auto Confirm User**: ✅ (check this)
4. Click **"Create user"**
5. Copy the user's **UUID** (you'll see it in the user list)

6. Go back to **"SQL Editor"**
7. Run this SQL (replace `USER_UUID_HERE` with the actual UUID):

```sql
-- Create admin user profile
INSERT INTO public.users (id, email, name, role)
VALUES (
  'USER_UUID_HERE',
  'admin@glossgirlies.com',
  'Admin',
  'admin'
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin';
```

Or if the user already exists in auth.users:

```sql
INSERT INTO public.users (id, email, name, role)
SELECT id, email, 'Admin', 'admin'
FROM auth.users
WHERE email = 'admin@glossgirlies.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin';
```

## Step 6: Test the Connection

1. Restart your Next.js dev server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000)

3. Try to:
   - Register a new user account
   - Login with the admin account
   - Browse products
   - Add items to cart

## Troubleshooting

### "Row Level Security policy violation"
- Make sure you ran the complete `schema.sql` file
- Check that RLS policies are enabled in Table Editor → Settings

### "User not found"
- Make sure the user exists in `auth.users`
- Run the SQL to create the user profile in `public.users`

### "Table does not exist"
- Go back to SQL Editor and run `schema.sql` again
- Check for any errors in the SQL execution

### Connection errors
- Verify your `.env.local` has the correct URL and key
- Make sure you restarted the dev server after creating `.env.local`
- Check Supabase dashboard to ensure project is active

## What Gets Created

The schema creates:
- ✅ 7 database tables
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Foreign key relationships
- ✅ Auto-updating timestamps
- ✅ Unique constraints

## Next Steps

After setup:
1. ✅ Test user registration
2. ✅ Test product browsing
3. ✅ Test cart functionality
4. ✅ Test order creation
5. ✅ Test admin features

Your Supabase backend is now ready! 🚀

