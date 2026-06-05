import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

import { getServerSession } from "@/lib/auth/session"
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit"

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
])
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    const { user } = await getServerSession()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const ip = getClientIp(request.headers)
    const limiter = checkRateLimit(`upload-media:${ip}`, 20, 60_000)
    if (!limiter.allowed) {
      return NextResponse.json(
        { error: "Too many uploads. Please wait before trying again." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(limiter.retryAfterMs / 1000)) },
        }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const filename = (formData.get("filename") as string) || file?.name || "upload"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!IMAGE_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "File must be an image (JPEG, PNG, WebP, or GIF)" },
        { status: 400 }
      )
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "Image must be 5MB or smaller" },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const subdir = "images"
    const mediaDir = join(process.cwd(), "public", subdir)
    if (!existsSync(mediaDir)) {
      await mkdir(mediaDir, { recursive: true })
    }

    const timestamp = Date.now()
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_")
    const uniqueFilename = `${timestamp}_${sanitizedFilename}`
    const filepath = join(mediaDir, uniqueFilename)

    await writeFile(filepath, buffer)

    const url = `/${subdir}/${uniqueFilename}`
    return NextResponse.json({
      url,
      filename: uniqueFilename,
      type: "image",
    })
  } catch (error) {
    console.error("Error uploading media:", error)
    return NextResponse.json({ error: "Failed to upload media" }, { status: 500 })
  }
}
