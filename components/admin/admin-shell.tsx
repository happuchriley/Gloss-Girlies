"use client"

interface AdminShellProps {
  userName?: string
  children: React.ReactNode
  preview?: boolean
  previewBase?: string
}

/** Auth-gated admin pages use the main SiteShell; this wrapper only renders page content. */
export function AdminShell({ children }: AdminShellProps) {
  return <>{children}</>
}
