import Link from "next/link"

import { AdminProductsView } from "@/components/admin/admin-products-view"
import { PreviewBanner } from "@/components/preview/preview-banner"
import { PageTransition } from "@/components/layout/page-transition"
import { mockAdminProducts } from "@/lib/preview/mock-data"

export default function PreviewAdminProductsPage() {
  return (
    <>
      <PreviewBanner role="admin" />
      <PageTransition className="container-app py-4 md:py-8">
        <AdminProductsView
          products={mockAdminProducts}
          preview
          backHref="/preview/admin"
        />
      </PageTransition>
      <div className="border-t border-pink-100 bg-white py-6 text-center">
        <Link href="/preview/admin" className="text-sm text-pink-600 hover:underline">
          ← Back to admin preview
        </Link>
      </div>
    </>
  )
}
