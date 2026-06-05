import Link from "next/link"
import { Eye } from "lucide-react"

import { Button } from "@/components/ui/button"

interface PreviewBannerProps {
  role: "customer" | "admin"
}

export function PreviewBanner({ role }: PreviewBannerProps) {
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3">
      <div className="container-app flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-start gap-2 text-sm text-amber-900">
          <Eye className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            <strong>UI preview</strong> — this {role} page uses sample data only. No login or
            database required.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="outline" className="border-amber-300 bg-white" asChild>
            <Link href="/preview">All previews</Link>
          </Button>
          <Button size="sm" className="bg-ink hover:bg-neutral-800" asChild>
            <Link href="/account?tab=login">Use real account</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
