/**
 * Verifies Supabase env config and that the backend schema is applied.
 *
 * Usage: npm run verify-supabase
 */
const { createClient } = require("@supabase/supabase-js")
const fs = require("fs")
const path = require("path")

function loadEnvFile(filename) {
  const filePath = path.join(process.cwd(), filename)
  if (!fs.existsSync(filePath)) return
  const content = fs.readFileSync(filePath, "utf8")
  for (const line of content.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnvFile(".env.local")
loadEnvFile(".env")

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY

const REQUIRED_TABLES = [
  "users",
  "products",
  "cart_items",
  "addresses",
  "orders",
  "order_items",
  "reviews",
  "wishlist",
  "payments",
  "inventory_movements",
  "shop_categories",
  "blog_posts",
]

console.log("\n🔍 Verifying Supabase backend...\n")

if (!supabaseUrl) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL is missing in .env.local")
  process.exit(1)
}

if (!supabaseAnonKey) {
  console.error(
    "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_KEY) is missing in .env.local"
  )
  process.exit(1)
}

console.log("✅ Environment variables found")
console.log(`   URL: ${supabaseUrl}`)
console.log(`   Key: ${supabaseAnonKey.substring(0, 20)}...`)

const urlMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)
if (urlMatch) {
  console.log(`   Project: ${urlMatch[1]}`)
}

function isMissingTableError(error) {
  if (!error) return false
  return (
    error.code === "PGRST205" ||
    error.message?.includes("does not exist") ||
    error.message?.includes("Could not find the table")
  )
}

async function verifyTables() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const results = await Promise.all(
    REQUIRED_TABLES.map(async (table) => {
      const { error } = await supabase.from(table).select("*").limit(0)
      return { table, missing: isMissingTableError(error) }
    })
  )

  const missing = results.filter((r) => r.missing).map((r) => r.table)
  const ok = results.filter((r) => !r.missing).map((r) => r.table)

  console.log("\n📦 Database tables:")
  for (const table of ok) {
    console.log(`   ✅ ${table}`)
  }
  for (const table of missing) {
    console.log(`   ❌ ${table} (missing)`)
  }

  if (missing.length > 0) {
    console.log("\n⚠️  Backend not fully applied.")
    console.log("   1. Open Supabase Dashboard → SQL Editor")
    console.log("   2. Paste and run: supabase/backend.sql")
    console.log("   3. Re-run: npm run verify-supabase\n")
    process.exit(1)
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (serviceKey) {
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { error: columnError } = await admin
      .from("orders")
      .select("fulfillment_type")
      .limit(1)

    const { error: otpTableError } = await admin
      .from("registration_otps")
      .select("id")
      .limit(1)

    console.log("\n📋 Auth / order columns:")
    if (otpTableError?.message?.includes("registration_otps")) {
      console.log("   ❌ registration_otps table (missing — run supabase/backend.sql)")
      process.exit(1)
    }
    if (!otpTableError) {
      console.log("   ✅ registration_otps")
    }

    console.log("\n📋 Order fulfillment column:")
    if (columnError?.message?.includes("fulfillment_type")) {
      console.log("   ❌ orders.fulfillment_type (missing — run supabase/backend.sql)")
      console.log(
        "      Or SQL Editor:\n" +
          "      ALTER TABLE public.orders\n" +
          "        ADD COLUMN IF NOT EXISTS fulfillment_type TEXT NOT NULL DEFAULT 'delivery'\n" +
          "          CHECK (fulfillment_type IN ('delivery', 'pickup'));\n"
      )
      process.exit(1)
    }
    if (columnError) {
      console.log(`   ⚠️  Could not verify: ${columnError.message}`)
    } else {
      console.log("   ✅ orders.fulfillment_type")
    }
  }

  if (!serviceKey) {
    console.log("\n💡 Add SUPABASE_SERVICE_ROLE_KEY to .env.local, then run:")
    console.log("   npm run seed:demo-users\n")
  } else {
    console.log("\n✅ Backend ready. Seed demo users with:")
    console.log("   npm run seed:demo-users\n")
  }
}

verifyTables().catch((err) => {
  console.error("\n❌ Verification failed:", err.message)
  process.exit(1)
})
