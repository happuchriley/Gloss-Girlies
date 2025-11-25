# Fix: "supabaseUrl is required" Error

## Current Status
✅ `.env.local` file exists and has correct variables
✅ Dev server has been restarted
⚠️ Browser may be using cached code

## Quick Fix Steps

### 1. Hard Refresh Browser
The browser is likely using cached JavaScript. Clear it:

**Windows/Linux:**
- Press `Ctrl + Shift + R` or `Ctrl + F5`

**Mac:**
- Press `Cmd + Shift + R`

### 2. Clear Browser Cache (if hard refresh doesn't work)

**Chrome/Edge:**
1. Press `F12` to open DevTools
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

**Or:**
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Click "Clear data"

### 3. Verify Environment Variables Are Loaded

After refreshing, check the browser console. You should see:
```
✅ Supabase client initialized successfully
   URL: https://hddiuzsxrgneysrnzgcb...
```

If you see warnings instead, the variables aren't being loaded.

### 4. If Still Not Working

#### Option A: Restart Dev Server Again
1. Stop the server (`Ctrl + C` in the terminal)
2. Delete `.next` folder: `rm -rf .next` (or `Remove-Item -Recurse -Force .next` on Windows)
3. Restart: `npm run dev`

#### Option B: Check for .env File Conflicts
Make sure you don't have a `.env` file that might override `.env.local`:
- `.env` (lower priority)
- `.env.local` (higher priority) ✅ Use this one

#### Option C: Verify Variable Names
Open `.env.local` and ensure:
- No spaces around `=`
- No quotes around values (unless needed)
- Exact variable names:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://hddiuzsxrgneysrnzgcb.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
  ```

## Why This Happens

Next.js embeds `NEXT_PUBLIC_*` variables at **build time**, not runtime:
1. When you start `npm run dev`, Next.js reads `.env.local`
2. It embeds the variables into the JavaScript bundle
3. The browser downloads this bundle
4. If the browser cached an old bundle (without variables), you get the error

## Verification

Run this to verify your setup:
```bash
npm run verify-supabase
```

This checks:
- ✅ Variables exist in `.env.local`
- ✅ URL format is correct
- ✅ Key format is valid

## Expected Console Output

**✅ Success:**
```
✅ Supabase client initialized successfully
   URL: https://hddiuzsxrgneysrnzgcb...
```

**❌ Error (if variables not loaded):**
```
⚠️ NEXT_PUBLIC_SUPABASE_URL is not set in .env.local
   Add: NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   ⚠️ IMPORTANT: Restart your dev server (npm run dev) after adding this!
```

## Still Having Issues?

1. **Check browser console** - Look for the exact error message
2. **Verify .env.local location** - Must be in root directory (same as `package.json`)
3. **Check terminal output** - Look for any errors when starting the server
4. **Try incognito/private window** - Rules out browser extensions interfering

