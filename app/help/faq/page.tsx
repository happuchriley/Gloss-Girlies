"use client"

import { ShopPageHeader } from "@/components/shop/shop-page-header"
import { PageTransition } from "@/components/layout/page-transition"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

const FAQS = [
  {
    question: "How do I place an order?",
    answer:
      "Browse products, add items to your bag, and proceed to checkout. You can shop as a guest or sign in to save your order history.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept Paystack (card & mobile money) and cash on delivery in eligible areas.",
  },
  {
    question: "How long does shipping take?",
    answer:
      "Standard shipping takes 5–7 business days. Express options are available at checkout.",
  },
  {
    question: "Can I return or exchange products?",
    answer:
      "Yes — unused products in original packaging can be returned within 7 days. See our Returns policy for details.",
  },
  {
    question: "How do I track my order?",
    answer:
      "Use the Track Order page with your order ID and email, or check your account order history after signing in.",
  },
  {
    question: "Are the products authentic?",
    answer:
      "Yes. We source from authorized distributors and trusted beauty brands.",
  },
  {
    question: "Do you ship outside Ghana?",
    answer:
      "We currently ship within Ghana. International shipping may be added in the future.",
  },
  {
    question: "How can I contact customer support?",
    answer:
      "Email support@glossgirlies.com or use the Contact page. We respond Monday–Saturday, 9 AM–6 PM GMT.",
  },
] as const

export default function FAQPage() {
  return (
    <PageTransition className="container-app py-6 md:py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/help"
          className="mb-4 inline-block text-sm text-pink-600 hover:text-pink-700"
        >
          ← Back to help center
        </Link>

        <ShopPageHeader
          eyebrow="Support"
          title="FAQ"
          subtitle="Everything you need to know before and after your purchase."
        />

        <Card className="mt-8 overflow-hidden rounded-2xl border-pink-100">
          <CardContent className="divide-y divide-pink-50 p-0">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group px-5 py-4 transition-colors open:bg-pink-50/30 sm:px-6"
              >
                <summary className="cursor-pointer list-none font-medium text-ink marker:hidden">
                  <span className="flex items-center justify-between gap-3">
                    {faq.question}
                    <span className="text-pink-400 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">{faq.answer}</p>
              </details>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  )
}
