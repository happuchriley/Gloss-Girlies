/** BMS Africa / mNotify SMS (https://bms.africa, https://developer.mnotify.com) */

export function getBmsApiKey(): string | undefined {
  return process.env.BMS_SMS_API_KEY?.trim() || undefined
}

export function getBmsSenderId(): string | undefined {
  return process.env.BMS_SMS_SENDER_ID?.trim() || undefined
}

export function getBmsApiBaseUrl(): string {
  return (
    process.env.BMS_SMS_API_BASE_URL?.replace(/\/$/, "") ||
    "https://api.mnotify.com/api"
  )
}

export function getAdminPhone(): string | undefined {
  return process.env.ADMIN_PHONE?.trim() || undefined
}

export function isSmsEnabled(): boolean {
  if (process.env.BMS_SMS_ENABLED === "false") return false
  return Boolean(getBmsApiKey() && getBmsSenderId())
}
