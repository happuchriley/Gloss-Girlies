# Supabase Backend Integration - Complete Guide

This e-commerce application now uses **Supabase** as its complete backend solution. All data is stored in Supabase PostgreSQL database with Row Level Security (RLS) policies.

## 🎯 What's Integrated

### ✅ Complete Backend Features

1. **Authentication** - Supabase Auth
   - User registration and login
   - Password management
   - Session management
   - User profiles in database

2. **Products** - Products table
   - Product CRUD operations
   - Inventory management
   - Stock tracking
   - Auto-seeding on first run

3. **Shopping Cart** - Cart items table
   - User-specific carts
   - Real-time sync
   - Persistent across sessions

4. **Orders** - Orders & Order items tables
   - Order creation and tracking
   - Order history per user
   - Admin order management
   - Order status updates

5. **Addresses** - Addresses table
   - User address book
   - Default address management
   - Saved addresses for checkout

6. **Reviews** - Reviews table
   - Product reviews with ratings
   - Image and video uploads (URLs stored)
   - User review management

## 🚀 Quick Setup

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in:
   - **Name**: Gloss Girlies
   - **Database Password**: (Save this!)
   - **Region**: Choose closest to your users
5. Click **"Create new project"**
6. Wait 1-2 minutes for setup

### Step 2: Get API Keys

1. In Supabase dashboard → **Settings** → **API**
2. Copy:
   - **Project URL**
   - **anon public** key

### Step 3: Set Environment Variables

Create `.env.local` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Run Database Schema

1. In Supabase dashboard → **SQL Editor**
2. Click **"New query"**
3. Open `supabase/schema.sql` from this project
4. Copy **ALL** the SQL code
5. Paste into SQL Editor
6. Click **"Run"** (or Ctrl+Enter)
7. Should see: "Success. No rows returned"

### Step 5: Create Admin User

1. Go to **Authentication** → **Users** → **Add user**
2. Create user with email: `admin@glossgirlies.com`
3. Copy the user's UUID
4. In **SQL Editor**, run:

```sql
-- Update user role to admin
UPDATE public.users
SET role = 'admin'
WHERE email = 'admin@glossgirlies.com';

-- Or if user doesn't exist in users table yet:
INSERT INTO public.users (id, email, name, role)
SELECT id, email, 'Admin', 'admin'
FROM auth.users
WHERE email = 'admin@glossgirlies.com';
```

### Step 6: Test the Application

1. Start dev server: `npm run dev`
2. Register a new user
3. Browse products
4. Add items to cart
5. Complete checkout
6. View orders

## 📊 Database Schema

The schema includes:

- **users** - User profiles (extends auth.users)
- **products** - Product catalog
- **cart_items** - Shopping cart items
- **orders** - Customer orders
- **order_items** - Order line items
- **addresses** - User shipping addresses
- **reviews** - Product reviews

All tables have:
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Auto-updating timestamps
- ✅ Foreign key constraints

## 🔒 Security Features

1. **Row Level Security (RLS)**
   - Users can only access their own data
   - Admins can access all data
   - Products are publicly readable
   - Reviews are publicly readable

2. **Authentication**
   - Supabase Auth handles all authentication
   - Secure password hashing
   - Session management
   - Token refresh

3. **Data Validation**
   - Database constraints
   - Type checking in TypeScript
   - Input validation in forms

## 🔄 How It Works

### Data Flow

1. **Client** → Makes request via Zustand store
2. **Store** → Checks if Supabase is configured
3. **Supabase Client** → Sends request to Supabase API
4. **Supabase** → Validates with RLS policies
5. **Database** → Executes query
6. **Response** → Returns to client
7. **Store** → Updates local state

### Fallback Behavior

- If Supabase is **not configured**: Uses localStorage
- If Supabase **fails**: Falls back to localStorage
- If **not authenticated**: Uses localStorage for cart

## 📝 Store Migration Status

| Store | Status | Features |
|-------|--------|----------|
| **authStore** | ✅ Complete | Login, Register, Password, Profile |
| **productStore** | ✅ Complete | CRUD, Inventory, Stock |
| **cartStore** | ✅ Complete | Add, Remove, Update, Sync |
| **orderStore** | ✅ Complete | Create, Track, Cancel, History |
| **reviewStore** | ✅ Complete | Add, View, Ratings |
| **addressStore** | ✅ Complete | Add, Update, Delete, Default |

## 🛠️ Troubleshooting

### "Supabase environment variables are not set"
- ✅ Check `.env.local` exists
- ✅ Verify variable names are exact
- ✅ Restart dev server after changes

### "Row Level Security policy violation"
- ✅ Run the complete `schema.sql`
- ✅ Check RLS is enabled in Supabase
- ✅ Verify user is authenticated

### "User not found"
- ✅ User must exist in `auth.users`
- ✅ Profile must exist in `public.users`
- ✅ Check user is authenticated

### Data not syncing
- ✅ Check browser console for errors
- ✅ Verify Supabase connection
- ✅ Check RLS policies
- ✅ Verify user authentication

## 🎨 Features

### For Users
- ✅ Secure authentication
- ✅ Persistent shopping cart
- ✅ Order history
- ✅ Saved addresses
- ✅ Product reviews

### For Admins
- ✅ Product management
- ✅ Inventory tracking
- ✅ Order management
- ✅ All user data access

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database/functions)

## 🔐 Production Checklist

Before deploying to production:

- [ ] Change admin password
- [ ] Set up proper email templates
- [ ] Configure CORS settings
- [ ] Set up database backups
- [ ] Review RLS policies
- [ ] Test all features
- [ ] Monitor usage in dashboard
- [ ] Set up error logging
- [ ] Configure custom domain (if needed)

## 💡 Tips

1. **Development**: Use Supabase local development (optional)
2. **Testing**: Create test users with different roles
3. **Monitoring**: Check Supabase dashboard for usage
4. **Performance**: Use indexes (already included)
5. **Backups**: Enable automatic backups in Supabase

---

**Your e-commerce is now powered by Supabase! 🚀**
