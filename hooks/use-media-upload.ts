"use client"

import { useCallback, useState } from "react"

export interface UploadedMedia {
  url: string
  type: "image"
  filename: string
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

export function isVideoMediaUrl(url: string): boolean {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url) || url.includes("/videos/")
}

export function isImageMediaUrl(url: string): boolean {
  return /\.(jpe?g|png|webp|gif)(\?|$)/i.test(url) || url.includes("/images/")
}

export function useMediaUpload() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = useCallback(async (file: File): Promise<UploadedMedia | null> => {
    setError(null)

    if (!IMAGE_TYPES.includes(file.type)) {
      setError("Upload a JPEG, PNG, WebP, or GIF image.")
      return null
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("filename", file.name)

      const response = await fetch("/api/upload-media", {
        method: "POST",
        body: formData,
      })

      const data = (await response.json()) as {
        url?: string
        filename?: string
        error?: string
      }

      if (!response.ok || !data.url) {
        setError(data.error ?? "Upload failed")
        return null
      }

      return {
        url: data.url,
        type: "image",
        filename: data.filename ?? file.name,
      }
    } catch {
      setError("Upload failed. Please try again.")
      return null
    } finally {
      setUploading(false)
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return { upload, uploading, error, clearError }
}
