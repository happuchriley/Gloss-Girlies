"use client"

import {
  ContentList,
  ContentPageLayout,
  ContentSection,
} from "@/components/content/content-page-layout"

export default function PrivacyPage() {
  return (
    <ContentPageLayout
      eyebrow="Legal"
      title="Privacy Policy"
      subtitle="How we handle your personal information."
      backHref="/policies"
      backLabel="Back to policies"
    >
      <ContentSection title="1. Information We Collect">
        <p>We collect information that you provide directly to us, including:</p>
        <ContentList
          items={[
            "Name, email address, and phone number",
            "Shipping and billing addresses",
            "Payment information (processed securely through payment gateways)",
            "Order history and preferences",
          ]}
        />
      </ContentSection>

      <ContentSection title="2. How We Use Your Information">
        <p>We use the information we collect to:</p>
        <ContentList
          items={[
            "Process and fulfill your orders",
            "Send you order confirmations and updates",
            "Respond to your inquiries and provide customer support",
            "Send you marketing communications (with your consent)",
            "Improve our website and services",
          ]}
        />
      </ContentSection>

      <ContentSection title="3. Information Sharing">
        <p>
          We do not sell, trade, or rent your personal information to third parties. We may
          share your information with service providers who assist us in operating our website
          and conducting our business, subject to confidentiality agreements.
        </p>
      </ContentSection>

      <ContentSection title="4. Data Security">
        <p>
          We implement appropriate security measures to protect your personal information.
          However, no method of transmission over the Internet is 100% secure.
        </p>
      </ContentSection>

      <ContentSection title="5. Your Rights">
        <p>You have the right to:</p>
        <ContentList
          items={[
            "Access your personal information",
            "Correct inaccurate information",
            "Request deletion of your information",
            "Opt out of marketing communications",
          ]}
        />
      </ContentSection>
    </ContentPageLayout>
  )
}
