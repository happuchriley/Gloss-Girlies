"use client"

import {
  ContentList,
  ContentPageLayout,
  ContentSection,
} from "@/components/content/content-page-layout"

export default function TermsPage() {
  return (
    <ContentPageLayout
      eyebrow="Legal"
      title="Terms of Service"
      subtitle="The rules for using Gloss Girlies."
      backHref="/policies"
      backLabel="Back to policies"
    >
      <ContentSection title="1. Acceptance of Terms">
        <p>
          By accessing and using Gloss Girlies, you accept and agree to be bound by the terms
          and provisions of this agreement.
        </p>
      </ContentSection>

      <ContentSection title="2. Use License">
        <p>
          Permission is granted to temporarily access materials on Gloss Girlies for personal,
          non-commercial transitory viewing only. Under this license you may not:
        </p>
        <ContentList
          items={[
            "Modify or copy the materials",
            "Use the materials for any commercial purpose",
            "Attempt to decompile or reverse engineer any software",
            "Remove any copyright or other proprietary notations",
          ]}
        />
      </ContentSection>

      <ContentSection title="3. Product Information">
        <p>
          We strive to provide accurate product descriptions and images. However, we do not
          warrant that product descriptions or other content on this site is accurate,
          complete, reliable, current, or error-free.
        </p>
      </ContentSection>

      <ContentSection title="4. Pricing">
        <p>
          All prices are listed in Ghana Cedis (₵). We reserve the right to change prices at
          any time without prior notice.
        </p>
      </ContentSection>

      <ContentSection title="5. Limitation of Liability">
        <p>
          In no event shall Gloss Girlies or its suppliers be liable for any damages arising
          out of the use or inability to use the materials on Gloss Girlies&apos; website.
        </p>
      </ContentSection>
    </ContentPageLayout>
  )
}
