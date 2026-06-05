import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers)
    const limiter = checkRateLimit(`upload-image:${ip}`, 12, 60_000)
    if (!limiter.allowed) {
      return NextResponse.json(
        { error: 'Too many uploads. Please wait before trying again.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(limiter.retryAfterMs / 1000)) },
        }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const filename = formData.get('filename') as string || file.name

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create images directory if it doesn't exist
    const imagesDir = join(process.cwd(), 'public', 'images')
    if (!existsSync(imagesDir)) {
      await mkdir(imagesDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    const uniqueFilename = `${timestamp}_${sanitizedFilename}`
    const filepath = join(imagesDir, uniqueFilename)

    // Write file
    await writeFile(filepath, buffer)

    // Return the URL
    const url = `/images/${uniqueFilename}`
    return NextResponse.json({ url, filename: uniqueFilename })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}

