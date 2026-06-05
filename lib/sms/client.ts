import {
  getBmsApiBaseUrl,
  getBmsApiKey,
  getBmsSenderId,
  isSmsEnabled,
} from "./config"

export interface SendSmsResult {
  success: boolean
  skipped?: boolean
  message?: string
  campaignId?: string
}

interface MNotifySmsResponse {
  status?: string
  message?: string
  code?: string
  summary?: { campaign_id?: string }
}

export async function sendBmsSms(
  recipients: string | string[],
  message: string,
  senderId?: string
): Promise<SendSmsResult> {
  if (!isSmsEnabled()) {
    return { success: true, skipped: true, message: "SMS not configured" }
  }

  const apiKey = getBmsApiKey()!
  const sender = senderId || getBmsSenderId()!
  const list = (Array.isArray(recipients) ? recipients : [recipients]).filter(
    Boolean
  )

  if (list.length === 0) {
    return { success: false, message: "No recipients" }
  }

  const base = getBmsApiBaseUrl()
  const url = new URL(`${base}/sms/quick`)
  url.searchParams.set("key", apiKey)

  try {
    const res = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify({
        recipient: list,
        sender,
        message: message.slice(0, 480),
        is_schedule: false,
        schedule_date: "",
      }),
    })

    const data = (await res.json().catch(() => ({}))) as MNotifySmsResponse

    if (!res.ok) {
      return {
        success: false,
        message: data.message || `SMS API error (${res.status})`,
      }
    }

    if (data.status && data.status !== "success") {
      return {
        success: false,
        message: data.message || "SMS send failed",
      }
    }

    return {
      success: true,
      campaignId: data.summary?.campaign_id,
      message: data.message,
    }
  } catch (error) {
    console.error("BMS SMS error:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "SMS request failed",
    }
  }
}
