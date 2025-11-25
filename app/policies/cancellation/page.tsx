'use client'

import BackButton from '@/components/BackButton'

export default function CancellationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4">
          <BackButton />
        </div>
        <h1 className="text-3xl font-bold mb-8">Cancellation Policy</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-xl font-bold mb-4">Order Cancellation</h2>
            <p className="text-gray-700 mb-4">
              You can cancel your order before it is shipped. Once your order has been shipped, you cannot cancel it, but you can return it after delivery as per our Return Policy.
            </p>
            <p className="text-gray-700">
              To cancel an order, please contact us at support@glossgirlies.com or call 1800-123-4567 with your order number.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Cancellation by Us</h2>
            <p className="text-gray-700">
              We reserve the right to cancel your order in certain circumstances, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-gray-700 ml-4 mt-2 space-y-1">
              <li>Product unavailability</li>
              <li>Pricing errors</li>
              <li>Fraudulent or suspicious activity</li>
              <li>Violation of terms of service</li>
            </ul>
            <p className="text-gray-700 mt-4">
              If we cancel your order, we will notify you and provide a full refund.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Refund for Cancelled Orders</h2>
            <p className="text-gray-700">
              If you cancel your order before shipment, you will receive a full refund to your original payment method within 3-5 business days.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

