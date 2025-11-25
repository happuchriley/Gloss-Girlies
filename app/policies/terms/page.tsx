'use client'

import BackButton from '@/components/BackButton'

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4">
          <BackButton />
        </div>
        <h1 className="text-3xl font-bold mb-8">Terms of Use</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700">
              By accessing and using Gloss Girlies, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">2. Use License</h2>
            <p className="text-gray-700 mb-2">
              Permission is granted to temporarily download one copy of the materials on Gloss Girlies' website for personal, non-commercial transitory viewing only.
            </p>
            <p className="text-gray-700">
              This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside text-gray-700 ml-4 mt-2 space-y-1">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose</li>
              <li>Attempt to decompile or reverse engineer any software</li>
              <li>Remove any copyright or other proprietary notations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">3. Product Information</h2>
            <p className="text-gray-700">
              We strive to provide accurate product descriptions and images. However, we do not warrant that product descriptions or other content on this site is accurate, complete, reliable, current, or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">4. Pricing</h2>
            <p className="text-gray-700">
              All prices are listed in Ghana Cedis (₵). We reserve the right to change prices at any time without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">5. Limitation of Liability</h2>
            <p className="text-gray-700">
              In no event shall Gloss Girlies or its suppliers be liable for any damages arising out of the use or inability to use the materials on Gloss Girlies' website.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

