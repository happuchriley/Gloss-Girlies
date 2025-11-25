'use client'

import BackButton from '@/components/BackButton'

export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4">
          <BackButton />
        </div>
        <h1 className="text-3xl font-bold mb-8">Return & Refund Policy</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-xl font-bold mb-4">Return Policy</h2>
            <p className="text-gray-700 mb-4">
              We want you to be completely satisfied with your purchase. You can return unused, unopened products within 7 days of delivery for a full refund or exchange.
            </p>
            <p className="text-gray-700">
              To be eligible for a return, your item must be unused, in the same condition that you received it, and in its original packaging.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">How to Return</h2>
            <ol className="list-decimal list-inside text-gray-700 ml-4 space-y-2">
              <li>Contact our customer support team at support@glossgirlies.com or call 1800-123-4567</li>
              <li>Provide your order number and reason for return</li>
              <li>We'll provide you with a return authorization and shipping instructions</li>
              <li>Package the item securely and ship it back to us</li>
              <li>Once we receive and inspect the item, we'll process your refund</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Refunds</h2>
            <p className="text-gray-700 mb-2">
              Refunds will be processed to the original payment method within 5-7 business days after we receive your returned item.
            </p>
            <p className="text-gray-700">
              Shipping charges are non-refundable unless the return is due to our error or a defective product.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Non-Returnable Items</h2>
            <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
              <li>Opened or used products</li>
              <li>Products without original packaging</li>
              <li>Personalized or customized items</li>
              <li>Products damaged by misuse</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}

