"use client"

import { useRef, useState } from "react"
import { Film, ImageIcon, Loader2, Upload, X } from "lucide-react"

import { useMediaUpload, isVideoMediaUrl } from "@/hooks/use-media-upload"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface MediaDropzoneProps {
  label: string
  hint?: string
  value: string
  onChange: (url: string) => void
  onUploaded?: (result: { url: string; type: "image" }) => void
  allowVideo?: boolean
  showUrlField?: boolean
  insertOnly?: boolean
  className?: string
}

export function MediaDropzone({
  label,
  hint,
  value,
  onChange,
  onUploaded,
  allowVideo = false,
  showUrlField = true,
  insertOnly = false,
  className,
}: MediaDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const { upload, uploading, error, clearError } = useMediaUpload()

  const accept = allowVideo
    ? "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
    : "image/jpeg,image/png,image/webp,image/gif"

  const handleFile = async (file: File) => {
    clearError()
    const result = await upload(file)
    if (!result) return
    if (!insertOnly) onChange(result.url)
    onUploaded?.(result)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) void handleFile(file)
  }

  const isVideo = value ? isVideoMediaUrl(value) : false

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={cn(
          "relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-5 text-center transition-colors",
          isDragging
            ? "border-brand bg-brand-light/60"
            : "border-pink-200 hover:border-pink-400 hover:bg-pink-50/50",
          uploading && "pointer-events-none opacity-60"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleFile(file)
            e.target.value = ""
          }}
          className="hidden"
        />

        {value ? (
          <div className="space-y-3">
            <div className="relative mx-auto max-w-full overflow-hidden rounded-xl border border-pink-100 bg-white">
              {isVideo ? (
                <p className="px-4 py-8 text-sm text-muted-foreground">
                  This cover is a video. Upload an image to replace it.
                </p>
              ) : (
                <img
                  src={value}
                  alt="Uploaded preview"
                  className="mx-auto max-h-48 w-full object-contain"
                />
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange("")
                }}
                className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-neutral-600 shadow hover:bg-white"
                aria-label="Remove media"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Click or drag to replace{allowVideo ? " · images or short videos (≤60s)" : ""}
            </p>
          </div>
        ) : (
          <div className="py-2">
            {uploading ? (
              <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-brand" />
            ) : (
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center gap-1 text-brand">
                {allowVideo ? (
                  <>
                    <ImageIcon className="h-5 w-5" />
                    <Film className="h-5 w-5" />
                  </>
                ) : (
                  <Upload className="h-8 w-8 text-pink-400" />
                )}
              </div>
            )}
            <p className="text-sm font-medium text-ink">
              {uploading ? "Uploading…" : "Drag and drop or click to upload"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {allowVideo
                ? "Images up to 5MB · Short videos up to 25MB (60s max)"
                : "JPEG, PNG, WebP, or GIF up to 5MB"}
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {showUrlField && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/images/cover.jpg"
          className="rounded-xl border-pink-200 font-mono text-xs"
        />
      )}
    </div>
  )
}
