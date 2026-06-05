"use client"

import { ContentPageLayout, ContentSection } from "@/components/content/content-page-layout"

export default function ShippingPage() {
  return (
    <ContentPageLayout
      eyebrow="Legal"
      title="Shipping"
      subtitle="How we deliver your beauty essentials across Ghana."
      backHref="/policies"
      backLabel="Back to policies"
    >
      <ContentSection title="Shipping Options">
        <div className="space-y-3">
          <div className="rounded-xl border border-pink-100 bg-pink-50/40 p-4">
            <p className="font-medium text-ink">Standard Shipping</p>
            <p className="mt-1 text-sm">5–7 business days — FREE</p>
          </div>
          <div className="rounded-xl border border-pink-100 bg-pink-50/40 p-4">
            <p className="font-medium text-ink">Express Shipping</p>
            <p className="mt-1 text-sm">2–3 business days — ₵99</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection title="Shipping Areas">
        <p>
          We ship to major cities and towns across Ghana. Delivery times may vary based on
          your location.
        </p>
      </ContentSection>

      <ContentSection title="Order Processing">
        <p>
          Orders are typically processed within 1–2 business days. You will receive an email
          confirmation with tracking information once your order ships.
        </p>
      </ContentSection>

      <ContentSection title="Delivery">
        <p>
          Our delivery partners will attempt delivery during business hours. If you are not
          available, they will attempt delivery again or leave the package at a safe
          location where authorized.
        </p>
        <p className="mt-3">
          Please ensure your shipping address is correct and complete to avoid delivery
          delays.
        </p>
      </ContentSection>
    </ContentPageLayout>
  )
}
