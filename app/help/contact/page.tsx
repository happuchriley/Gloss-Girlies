"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, MapPin, Phone } from "lucide-react"

import { ShopPageHeader } from "@/components/shop/shop-page-header"
import { PageTransition } from "@/components/layout/page-transition"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { siteConfig } from "@/config/site"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <PageTransition className="container-app py-6 md:py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/help"
          className="mb-4 inline-block text-sm text-pink-600 hover:text-pink-700"
        >
          ← Back to help center
        </Link>

        <ShopPageHeader
          eyebrow="Support"
          title="Contact us"
          subtitle="Reach our team for order updates, product help, and account questions."
        />

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card className="rounded-2xl border-pink-100">
            <CardHeader className="border-b border-pink-100 bg-pink-50/30">
              <CardTitle className="font-display text-xl">Get in touch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-pink-100 p-2">
                  <Mail className="h-4 w-4 text-pink-600" />
                </div>
                <div>
                  <p className="font-medium text-ink">Email</p>
                  <p className="text-sm text-neutral-500">{siteConfig.supportEmail}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-pink-100 p-2">
                  <Phone className="h-4 w-4 text-pink-600" />
                </div>
                <div>
                  <p className="font-medium text-ink">Phone</p>
                  <p className="text-sm text-neutral-500">{siteConfig.supportPhone}</p>
                  <p className="text-xs text-neutral-400">Mon–Sat, 9 AM – 6 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-pink-100 p-2">
                  <MapPin className="h-4 w-4 text-pink-600" />
                </div>
                <div>
                  <p className="font-medium text-ink">Address</p>
                  <p className="text-sm text-neutral-500">
                    123 Beauty Street
                    <br />
                    Accra, Ghana
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-pink-100">
            <CardHeader className="border-b border-pink-100 bg-pink-50/30">
              <CardTitle className="font-display text-xl">Send a message</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {submitted ? (
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  Thanks! Your message was received. We&apos;ll respond soon.
                </p>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Name</Label>
                    <Input
                      id="contactName"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="rounded-xl border-pink-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="rounded-xl border-pink-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactSubject">Subject</Label>
                    <Input
                      id="contactSubject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="rounded-xl border-pink-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactMessage">Message</Label>
                    <textarea
                      id="contactMessage"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      className="w-full rounded-xl border border-pink-200 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full rounded-full bg-pink-600 hover:bg-pink-500"
                  >
                    Send message
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  )
}
