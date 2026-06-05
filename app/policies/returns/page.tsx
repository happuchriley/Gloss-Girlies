"use client"

import {
  ContentList,
  ContentPageLayout,
  ContentSection,
} from "@/components/content/content-page-layout"

export default function ReturnsPage() {
  return (
    <ContentPageLayout
      eyebrow="Legal"
      title="Returns & Refunds"
      subtitle="Our policy for returns, exchanges, and refunds."
      backHref="/policies"
      backLabel="Back to policies"
    >
      <ContentSection title="Return Policy">
        <p>
          You can return unused, unopened products within 7 days of delivery for a full
          refund or exchange. Items must be unused, in the same condition you received them,
          and in original packaging.
        </p>
      </ContentSection>

      <ContentSection title="How to Return">
        <ContentList
          ordered
          items={[
            "Contact support at support@glossgirlies.com",
            "Provide your order number and reason for return",
            "We will send return authorization and shipping instructions",
            "Package the item securely and ship it back to us",
            "Once received and inspected, we process your refund",
          ]}
        />
      </ContentSection>

      <ContentSection title="Refunds">
        <p>
          Refunds are processed to the original payment method within 5–7 business days
          after we receive your returned item. Shipping charges are non-refundable unless
          the return is due to our error or a defective product.
        </p>
      </ContentSection>

      <ContentSection title="Non-Returnable Items">
        <ContentList
          items={[
            "Opened or used products",
            "Products without original packaging",
            "Personalized or customized items",
            "Products damaged by misuse",
          ]}
        />
      </ContentSection>
    </ContentPageLayout>
  )
}
