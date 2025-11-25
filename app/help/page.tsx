'use client'

import BackButton from '@/components/BackButton'

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <BackButton />
      </div>
      <h1 className="text-3xl font-bold mb-8">Help Center</h1>
      
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">How can we help you?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <a href="/help/faq" className="p-4 border border-gray-200 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition-colors">
              <h3 className="font-bold mb-2">Frequently Asked Questions</h3>
              <p className="text-sm text-gray-600">Find answers to common questions</p>
            </a>
            <a href="/help/contact" className="p-4 border border-gray-200 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition-colors">
              <h3 className="font-bold mb-2">Contact Us</h3>
              <p className="text-sm text-gray-600">Get in touch with our support team</p>
            </a>
            <a href="/track-order" className="p-4 border border-gray-200 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition-colors">
              <h3 className="font-bold mb-2">Track Your Order</h3>
              <p className="text-sm text-gray-600">Check the status of your order</p>
            </a>
            <a href="/policies/returns" className="p-4 border border-gray-200 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition-colors">
              <h3 className="font-bold mb-2">Returns & Refunds</h3>
              <p className="text-sm text-gray-600">Learn about our return policy</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

