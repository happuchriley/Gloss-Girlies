'use client'

import BackButton from '@/components/BackButton'

export default function FAQPage() {
  const faqs = [
    {
      question: 'How do I place an order?',
      answer: 'Simply browse our products, add items to your cart, and proceed to checkout. You\'ll need to create an account or login to complete your purchase.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept credit/debit cards and cash on delivery (COD) for your convenience.'
    },
    {
      question: 'How long does shipping take?',
      answer: 'Standard shipping typically takes 5-7 business days. Express shipping options are available at checkout.'
    },
    {
      question: 'Can I return or exchange products?',
      answer: 'Yes, you can return unused products within 7 days of delivery. Please check our Return Policy for detailed information.'
    },
    {
      question: 'How do I track my order?',
      answer: 'Once your order is shipped, you\'ll receive a tracking number via email. You can also track your order using our Track Order page.'
    },
    {
      question: 'Are the products authentic?',
      answer: 'Yes, we guarantee 100% authentic products from authorized distributors and brands.'
    },
    {
      question: 'Do you offer international shipping?',
      answer: 'Currently, we only ship within India. International shipping may be available in the future.'
    },
    {
      question: 'How can I contact customer support?',
      answer: 'You can reach us via email at support@glossgirlies.com or call us at 1800-123-4567. Our support team is available Monday to Saturday, 9 AM to 6 PM.'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <BackButton />
      </div>
      <h1 className="text-3xl font-bold mb-8">Frequently Asked Questions</h1>
      
      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold mb-2">{faq.question}</h2>
            <p className="text-gray-700">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

