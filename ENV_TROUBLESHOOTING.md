# Environment Variables Troubleshooting

## Common Error: "supabaseUrl is required"

This error occurs when the Supabase environment variables are not loaded properly.

## Solution Steps

### 1. Verify `.env.local` File Exists

Create a `.env.local` file in the root directory (same level as `package.json`) with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 2. Check Variable Names (Case-Sensitive!)

**✅ CORRECT:**
- `NEXT_PUBLIC_SUPABASE_URL` (all uppercase, underscores)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (all uppercase, underscores)

**❌ WRONG:**
- `next_public_supabase_url` (lowercase)
- `NEXT_PUBLIC_SUPABASE_URL=` (trailing space)
- `NEXT_PUBLIC_SUPABASE_URL =` (spaces around =)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (missing NEXT_PUBLIC_ prefix)

### 3. Restart Development Server

**IMPORTANT:** After creating or updating `.env.local`, you MUST restart the dev server:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

Next.js only reads `NEXT_PUBLIC_*` variables at **build/start time**, not at runtime.

### 4. Verify Configuration

Run the verification script:

```bash
npm run verify-supabase
```

This will check:
- ✅ Variables exist
- ✅ URL format is correct
- ✅ Key format is valid

### 5. Check for Common Issues

#### Issue: Variables not loading
- **Cause:** Dev server not restarted after creating `.env.local`
- **Fix:** Stop and restart `npm run dev`

#### Issue: "supabaseUrl is required" error
- **Cause:** Variable is undefined or empty
- **Fix:** 
  1. Check `.env.local` file exists
  2. Check variable names match exactly (case-sensitive)
  3. Check no extra spaces or quotes
  4. Restart dev server

#### Issue: Variables work in verify script but not in app
- **Cause:** Browser cache or dev server needs restart
- **Fix:** 
  1. Restart dev server
  2. Clear browser cache
  3. Hard refresh (Ctrl+Shift+R)

## File Location

```
Gloss Girlies/
├── .env.local          ← Create this file here
├── package.json
├── lib/
│   └── supabase.ts     ← Uses the variables
└── ...
```

## Variable Naming Convention

All Supabase environment variables follow this pattern:

- **Prefix:** `NEXT_PUBLIC_` (required for client-side access)
- **Service:** `SUPABASE_`
- **Type:** `URL` or `ANON_KEY`

**Full names:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Alternative: Using SUPABASE_KEY

You can also use `SUPABASE_KEY` instead of `NEXT_PUBLIC_SUPABASE_ANON_KEY`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key_here
```

**Note:** `SUPABASE_KEY` is only available server-side. For client-side access, use `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Still Having Issues?

1. Run `npm run verify-supabase` to check configuration
2. Check browser console for specific error messages
3. Verify `.env.local` is in the root directory
4. Ensure no `.env` file is overriding `.env.local`
5. Check that variables don't have quotes around values (unless needed)

