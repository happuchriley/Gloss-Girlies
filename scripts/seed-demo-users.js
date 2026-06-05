/**
 * Creates demo customer + admin users in Supabase Auth and public.users.
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in .env.local
 *
 * Usage: npm run seed:demo-users
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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL || "demo@glossgirlies.com"
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD || "Demo123!"
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@glossgirlies.com"
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "Admin123!"

const envPath = path.join(process.cwd(), ".env.local")
if (!fs.existsSync(envPath)) {
  console.error("No .env.local found.")
  console.error("  1. Copy .env.example to .env.local")
  console.error("  2. Add your Supabase URL and keys from https://supabase.com/dashboard")
  process.exit(1)
}

if (!url || !serviceKey || serviceKey === "your-service-role-key" || serviceKey.length < 20) {
  console.error("Missing or invalid Supabase credentials in .env.local:\n")
  if (!url || url.includes("your-project")) {
    console.error("  ✗ NEXT_PUBLIC_SUPABASE_URL — Dashboard → Settings → API → Project URL")
  }
  if (!serviceKey || serviceKey.length < 20) {
    console.error("  ✗ SUPABASE_SERVICE_ROLE_KEY — Dashboard → Settings → API → service_role (secret)")
    console.error("    (Not the anon key — seeding requires the service role key.)")
  }
  console.error("\nThen run: npm run seed:demo-users")
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function upsertAuthUser({ email, password, name, role, phone }) {
  const { data: listed } = await supabase.auth.admin.listUsers()
  const existing = listed?.users?.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  )

  let userId = existing?.id

  if (existing) {
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { name, phone, role },
    })
    if (error) throw error
    console.log(`Updated auth user: ${email}`)
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, phone, role },
    })
    if (error) throw error
    userId = data.user.id
    console.log(`Created auth user: ${email}`)
  }

  const { error: profileError } = await supabase.from("users").upsert(
    {
      id: userId,
      email,
      name,
      phone: phone ?? null,
      role,
      email_verified_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  )

  if (profileError) throw profileError
  console.log(`Upserted profile (${role}): ${email}`)
}

async function main() {
  await upsertAuthUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    name: "Ama Demo",
    phone: "+233201234567",
    role: "user",
  })

  await upsertAuthUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    name: "Gloss Admin",
    phone: "+233209876543",
    role: "admin",
  })

  console.log("\nDemo accounts ready:")
  console.log(`  Customer  ${DEMO_EMAIL} / ${DEMO_PASSWORD}`)
  console.log(`  Admin     ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
