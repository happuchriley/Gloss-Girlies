# Environment Variables Setup

This file contains all the environment variables needed for the application.

## Setup Instructions

1. Copy the example file:

```bash
cp .env.example .env.local
```

2. Update the values in `.env.local` with your actual credentials.

## Required Environment Variables

### Payment Gateway - MTN Mobile Money (Ghana)

```
MTN_MOMO_SUBSCRIPTION_KEY=your_subscription_key
MTN_MOMO_API_USER=your_api_user
MTN_MOMO_API_KEY=your_api_key
MTN_MOMO_ENVIRONMENT=sandbox  # or 'production'
MTN_MOMO_TARGET_ENVIRONMENT=sandbox  # or 'production'
```

**Note:**

- All MTN MoMo credentials should only be in `.env.local` (server-side), never in `.env` (client-side)
- Get your MTN MoMo credentials from [MTN Developer Portal](https://momodeveloper.mtn.com/)
- For sandbox testing, use test credentials provided by MTN
- See `MTN_MOMO_GHANA_SETUP.md` for detailed setup instructions

### Admin Credentials

```
ADMIN_EMAIL=admin@glossgirlies.com
ADMIN_PASSWORD=admin123
```

### Application URLs

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Email Service (for notifications)

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_email_password
```

### Supabase (Backend Database)

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**How to get your Supabase credentials:**

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Project Settings > API
4. Copy the "Project URL" and "anon/public" key
5. Paste them into your `.env.local` file

**Database Setup:**

1. Go to SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `supabase/schema.sql`
3. Run the SQL to create all tables and policies

### JWT Secret

```
JWT_SECRET=your_jwt_secret_key_here
```

### Stripe (optional, for future use)

```
STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

## Security Notes

- Never commit `.env.local` to version control
- Use strong, unique values for production
- Rotate secrets regularly
- Use environment-specific values (development, staging, production)
