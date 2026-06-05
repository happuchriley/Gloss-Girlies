"use client"

import {
  ContentList,
  ContentPageLayout,
  ContentSection,
} from "@/components/content/content-page-layout"

export default function CancellationPage() {
  return (
    <ContentPageLayout
      eyebrow="Legal"
      title="Cancellation"
      subtitle="How to cancel orders and what happens next."
      backHref="/policies"
      backLabel="Back to policies"
    >
      <ContentSection title="Order Cancellation">
        <p>
          You can cancel your order before it is shipped. Once shipped, you cannot cancel
          but may return it after delivery per our Returns policy.
        </p>
        <p className="mt-3">
          To cancel, contact support@glossgirlies.com with your order number.
        </p>
      </ContentSection>

      <ContentSection title="Cancellation by Us">
        <p>We may cancel orders when:</p>
        <ContentList
          items={[
            "Product is unavailable",
            "Pricing errors occur",
            "Fraudulent or suspicious activity is detected",
            "Terms of service are violated",
          ]}
        />
        <p className="mt-3">
          If we cancel your order, we will notify you and provide a full refund.
        </p>
      </ContentSection>

      <ContentSection title="Refund for Cancelled Orders">
        <p>
          Cancellations before shipment receive a full refund to your original payment
          method within 3–5 business days.
        </p>
      </ContentSection>
    </ContentPageLayout>
  )
}
