/**
 * Supabase Configuration Verification Script
 * 
 * Run this to verify your Supabase setup:
 * node scripts/verify-supabase.js
 */

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

console.log('\n🔍 Verifying Supabase Configuration...\n');

// Check if both URL and key exist
if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is missing!');
  console.error('   Add it to your .env.local file');
  process.exit(1);
}

if (!supabaseAnonKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_KEY is missing!');
  console.error('   Add it to your .env.local file');
  process.exit(1);
}

console.log('✅ Environment variables found');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseAnonKey.substring(0, 20)}...`);

// Extract project reference from URL
const urlMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
if (urlMatch) {
  console.log(`   Project Reference: ${urlMatch[1]}`);
}

// Try to decode JWT to verify it's valid
try {
  const jwtParts = supabaseAnonKey.split('.');
  if (jwtParts.length === 3) {
    const payload = JSON.parse(Buffer.from(jwtParts[1], 'base64').toString());
    console.log(`   JWT Role: ${payload.role}`);
    console.log(`   JWT Ref: ${payload.ref}`);
    
    if (payload.ref && urlMatch && payload.ref !== urlMatch[1]) {
      console.warn('⚠️  Warning: Project reference in URL and JWT do not match!');
    }
  }
} catch (e) {
  console.warn('⚠️  Could not decode JWT (this is okay)');
}

console.log('\n📋 Next Steps:');
console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
console.log('2. Open SQL Editor');
console.log('3. Run the schema from: supabase/schema.sql');
console.log('4. Create an admin user (see SETUP_DATABASE.md)');
console.log('5. Restart your dev server: npm run dev\n');

console.log('✅ Configuration looks good! Make sure to run the database schema.\n');

