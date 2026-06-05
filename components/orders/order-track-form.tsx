"use client"

import { useState } from "react"
import { ChevronDown, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface OrderTrackFormValues {
  orderId: string
  trackingNumber: string
  guestEmail: string
  guestToken: string
}

interface OrderTrackFormProps {
  values: OrderTrackFormValues
  onChange: (field: keyof OrderTrackFormValues, value: string) => void
  onSubmit: () => void
  loading?: boolean
  error?: string
  isAuthenticated?: boolean
}

export function OrderTrackForm({
  values,
  onChange,
  onSubmit,
  loading = false,
  error,
  isAuthenticated = false,
}: OrderTrackFormProps) {
  const [guestOpen, setGuestOpen] = useState(!isAuthenticated)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <Card className="overflow-hidden rounded-2xl border-pink-100">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orderId">Order ID</Label>
            <Input
              id="orderId"
              value={values.orderId}
              onChange={(e) => onChange("orderId", e.target.value)}
              placeholder="e.g. ORD-..."
              className="rounded-xl border-pink-200"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trackingNumber">Tracking number (optional)</Label>
            <Input
              id="trackingNumber"
              value={values.trackingNumber}
              onChange={(e) => onChange("trackingNumber", e.target.value)}
              placeholder="GGTRK-..."
              className="rounded-xl border-pink-200 font-mono text-sm"
              autoComplete="off"
            />
          </div>

          <button
            type="button"
            onClick={() => setGuestOpen((open) => !open)}
            className="flex w-full items-center justify-between rounded-xl border border-pink-100 bg-pink-50/40 px-4 py-3 text-left text-sm font-medium text-ink"
          >
            <span>Guest order details</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-pink-500 transition-transform",
                guestOpen && "rotate-180"
              )}
            />
          </button>

          {guestOpen && (
            <div className="space-y-4 rounded-xl border border-pink-100 p-4">
              <p className="text-xs text-muted-foreground">
                {isAuthenticated
                  ? "Use these fields only if you checked out as a guest before signing in."
                  : "Enter the email and access token from your order confirmation email or SMS."}
              </p>
              <div className="space-y-2">
                <Label htmlFor="guestEmail">Email</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  value={values.guestEmail}
                  onChange={(e) => onChange("guestEmail", e.target.value)}
                  className="rounded-xl border-pink-200"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guestToken">Access token</Label>
                <Input
                  id="guestToken"
                  value={values.guestToken}
                  onChange={(e) => onChange("guestToken", e.target.value)}
                  placeholder="From your confirmation"
                  className="rounded-xl border-pink-200 font-mono text-xs"
                  autoComplete="off"
                />
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brand hover:bg-brand-dark"
          >
            <Search className="mr-2 h-4 w-4" />
            {loading ? "Searching…" : "Track order"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
