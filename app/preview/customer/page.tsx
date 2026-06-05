import { PreviewBanner } from "@/components/preview/preview-banner"
import { CustomerDashboardPreview } from "@/components/preview/customer-dashboard-preview"
import { mockCustomer, mockCustomerOrders } from "@/lib/preview/mock-data"

export default function PreviewCustomerPage() {
  return (
    <>
      <PreviewBanner role="customer" />
      <CustomerDashboardPreview user={mockCustomer} orders={mockCustomerOrders} />
    </>
  )
}
