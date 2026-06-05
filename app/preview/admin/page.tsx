import Link from "next/link"

import { AdminDashboardPreview } from "@/components/preview/admin-dashboard-preview"
import { PreviewBanner } from "@/components/preview/preview-banner"
import {
  mockAdmin,
  mockAdminMetrics,
  mockAdminOrders,
} from "@/lib/preview/mock-data"

export default function PreviewAdminPage() {
  return (
    <>
      <PreviewBanner role="admin" />
      <AdminDashboardPreview
        user={mockAdmin}
        metrics={mockAdminMetrics}
        recentOrders={mockAdminOrders}
      />
      <div className="border-t border-pink-100 bg-white py-8 text-center">
        <Link href="/preview" className="text-sm text-pink-600 hover:underline">
          ← Back to all previews
        </Link>
      </div>
    </>
  )
}
