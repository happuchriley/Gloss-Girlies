# Supabase Setup Guide

This guide will help you set up Supabase as the backend for Gloss Girlies.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: Gloss Girlies (or your preferred name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be set up (takes 1-2 minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")

## Step 3: Set Up Environment Variables

1. Create a `.env.local` file in the root of your project (if it doesn't exist)
2. Add the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace `your_project_url_here` and `your_anon_key_here` with the values you copied.

## Step 4: Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Open the file `supabase/schema.sql` from this project
4. Copy all the SQL code
5. Paste it into the SQL Editor
6. Click "Run" (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

This will create:
- All necessary tables (users, products, cart_items, orders, etc.)
- Indexes for better performance
- Row Level Security (RLS) policies
- Triggers for auto-updating timestamps

## Step 5: Create an Admin User

After setting up the database, you need to create an admin user:

1. Go to **Authentication** > **Users** in your Supabase dashboard
2. Click "Add user" > "Create new user"
3. Enter:
   - **Email**: admin@glossgirlies.com (or your preferred admin email)
   - **Password**: Choose a strong password
4. Click "Create user"
5. Copy the user's UUID (you'll need this)
6. Go to **SQL Editor** and run:

```sql
UPDATE public.users
SET role = 'admin'
WHERE email = 'admin@glossgirlies.com';
```

Or if the user doesn't exist in the users table yet:

```sql
INSERT INTO public.users (id, email, name, role)
SELECT id, email, 'Admin', 'admin'
FROM auth.users
WHERE email = 'admin@glossgirlies.com';
```

## Step 6: Seed Initial Products (Optional)

If you want to populate the database with initial products:

1. Go to **SQL Editor**
2. You can manually insert products or use the admin panel in the app
3. Products can be added through the Admin Dashboard once you're logged in as admin

## Step 7: Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Try to:
   - Register a new user
   - Log in
   - Browse products
   - Add items to cart

## Troubleshooting

### "Supabase environment variables are not set"
- Make sure `.env.local` exists in the root directory
- Check that the variable names are exactly: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart your development server after adding/changing environment variables

### "Row Level Security policy violation"
- Make sure you've run the `schema.sql` file completely
- Check that RLS policies are enabled in your Supabase dashboard
- Verify that you're authenticated when trying to access protected data

### "User not found" or authentication issues
- Make sure the user exists in `auth.users` table
- Check that the user profile exists in `public.users` table
- Verify that the user is properly authenticated

## Security Notes

- Never commit `.env.local` to version control (it's already in `.gitignore`)
- The `anon` key is safe to use in client-side code (it's protected by RLS policies)
- For server-side operations, consider using the `service_role` key (but never expose it in client code)
- Always use Row Level Security policies to protect your data

## Next Steps

After setup:
1. Test all features (authentication, cart, orders, etc.)
2. Set up email templates in Supabase (for password reset, etc.)
3. Configure storage buckets if you need file uploads
4. Set up database backups
5. Monitor usage in the Supabase dashboard

