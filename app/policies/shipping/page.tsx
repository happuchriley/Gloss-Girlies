'use client'

import BackButton from '@/components/BackButton'

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4">
          <BackButton />
        </div>
        <h1 className="text-3xl font-bold mb-8">Shipping Information</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-xl font-bold mb-4">Shipping Options</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold mb-2">Standard Shipping</h3>
                <p className="text-gray-700">5-7 business days - FREE</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Express Shipping</h3>
                <p className="text-gray-700">2-3 business days - ₵99</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Shipping Areas</h2>
            <p className="text-gray-700">
              We currently ship to all major cities and towns across India. Shipping charges may vary based on location.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Order Processing</h2>
            <p className="text-gray-700">
              Orders are typically processed within 1-2 business days. You will receive an email confirmation with tracking information once your order ships.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Delivery</h2>
            <p className="text-gray-700 mb-2">
              Our delivery partners will attempt delivery during business hours. If you're not available, they will attempt delivery again or leave the package at a safe location (if authorized).
            </p>
            <p className="text-gray-700">
              Please ensure your shipping address is correct and complete to avoid delivery delays.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

