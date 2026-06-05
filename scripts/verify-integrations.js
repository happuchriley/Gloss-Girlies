/**
 * Verifies Paystack and BMS SMS env configuration.
 *
 * Usage: npm run verify-integrations
 */
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

console.log("\n🔌 Verifying integrations...\n")

const checks = [
  {
    name: "Paystack public key",
    key: "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY",
    required: true,
    hint: "Dashboard → Settings → API Keys → Public key (pk_test_ or pk_live_)",
  },
  {
    name: "Paystack secret key",
    key: "PAYSTACK_SECRET_KEY",
    required: true,
    hint: "Dashboard → Settings → API Keys → Secret key (server-only)",
  },
  {
    name: "BMS SMS API key",
    key: "BMS_SMS_API_KEY",
    required: true,
    hint: "https://apps.mnotify.net or https://bms.africa",
  },
  {
    name: "BMS SMS sender ID",
    key: "BMS_SMS_SENDER_ID",
    required: true,
    hint: "Registered sender ID (max 11 characters)",
  },
  {
    name: "Admin phone (SMS alerts)",
    key: "ADMIN_PHONE",
    required: false,
    hint: "Ghana format: 233XXXXXXXXX",
  },
  {
    name: "App URL",
    key: "NEXT_PUBLIC_APP_URL",
    required: true,
    hint: "Production: https://your-domain.vercel.app",
  },
]

let missingRequired = 0

for (const check of checks) {
  const value = process.env[check.key]?.trim()
  const ok = Boolean(value && value.length > 3 && !value.includes("your-"))
  if (ok) {
    console.log(`   ✅ ${check.name}`)
  } else if (check.required) {
    console.log(`   ❌ ${check.name}`)
    console.log(`      → ${check.hint}`)
    missingRequired++
  } else {
    console.log(`   ⚠️  ${check.name} (optional)`)
    console.log(`      → ${check.hint}`)
  }
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "")
if (appUrl) {
  console.log("\n📎 Paystack webhook URL (add in Paystack dashboard):")
  console.log(`   ${appUrl}/api/payment/paystack/webhook`)
}

const smsDisabled = process.env.BMS_SMS_ENABLED === "false"
if (smsDisabled) {
  console.log("\n⚠️  BMS_SMS_ENABLED=false — SMS sending is disabled")
}

if (missingRequired > 0) {
  console.log(
    `\n⚠️  ${missingRequired} required integration variable(s) missing in .env.local`
  )
  console.log("   See DEPLOY_VERCEL.md for Vercel env setup.\n")
  process.exit(1)
}

console.log("\n✅ Paystack and BMS SMS are configured.\n")
