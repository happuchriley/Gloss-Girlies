/**
 * Canonical app URL for callbacks, SMS links, and Paystack redirects.
 * On Vercel, set NEXT_PUBLIC_APP_URL to your production domain in project env vars.
 */
export function getAppUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (explicit) {
    return explicit.replace(/\/$/, "")
  }

  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (productionHost) {
    return `https://${productionHost.replace(/\/$/, "")}`
  }

  const vercelHost = process.env.VERCEL_URL?.trim()
  if (vercelHost) {
    return `https://${vercelHost.replace(/\/$/, "")}`
  }

  return "http://localhost:3000"
}
