"use client"

import Link from "next/link"
import { Clock, MapPin, Store, Truck } from "lucide-react"

import { pickupLocation } from "@/config/pickup"
import { countries } from "@/lib/countries"
import type { FulfillmentType } from "@/lib/orders/fulfillment"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ShippingAddress } from "@/store/orderStore"

interface SavedAddress {
  id: string
  fullName?: string
  full_name?: string
  phone?: string
  addressLine1?: string
  address_line1?: string
  addressLine2?: string
  address_line2?: string
  city?: string
  state?: string
  country?: string
  label?: string
}

interface AddressStepProps {
  fulfillmentType: FulfillmentType
  onFulfillmentTypeChange: (type: FulfillmentType) => void
  address: ShippingAddress
  onAddressChange: (address: ShippingAddress) => void
  guestEmail: string
  onGuestEmailChange: (email: string) => void
  isAuthenticated: boolean
  savedAddresses?: SavedAddress[]
  onUseSavedAddress?: (addr: SavedAddress) => void
  errors: Record<string, string>
  onSubmit: (e: React.FormEvent) => void
}

export function AddressStep({
  fulfillmentType,
  onFulfillmentTypeChange,
  address,
  onAddressChange,
  guestEmail,
  onGuestEmailChange,
  isAuthenticated,
  savedAddresses = [],
  onUseSavedAddress,
  errors,
  onSubmit,
}: AddressStepProps) {
  const isPickup = fulfillmentType === "pickup"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-primary" />
          How would you like to receive your order?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          {(
            [
              {
                id: "delivery" as const,
                title: "Delivery",
                description: "Ship to your address in Ghana",
                icon: Truck,
              },
              {
                id: "pickup" as const,
                title: "Store pickup",
                description: "Collect from our Accra store",
                icon: Store,
              },
            ] as const
          ).map((option) => {
            const Icon = option.icon
            const active = fulfillmentType === option.id
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onFulfillmentTypeChange(option.id)}
                className={cn(
                  "flex gap-3 rounded-xl border p-4 text-left transition-colors",
                  active
                    ? "border-brand bg-brand-light/50"
                    : "border-border hover:border-brand/40"
                )}
              >
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                <div>
                  <p className="font-medium text-ink">{option.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {isPickup && (
          <div className="mb-6 rounded-xl border border-pink-100 bg-brand-light/30 p-4">
            <p className="text-sm font-semibold text-ink">{pickupLocation.name}</p>
            <p className="mt-1 text-sm text-neutral-600">
              {pickupLocation.addressLine1}
              {pickupLocation.addressLine2 ? `, ${pickupLocation.addressLine2}` : ""}
              <br />
              {pickupLocation.city}, {pickupLocation.country}
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {pickupLocation.hours}
            </p>
            <p className="mt-3 text-xs text-neutral-600">
              Pay online with Paystack or pay when you collect — choose on the next
              step.
            </p>
          </div>
        )}

        {!isAuthenticated && (
          <div className="mb-6 rounded-xl border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-white p-5">
            <p className="text-sm font-semibold text-ink">You&apos;re checking out as a guest</p>
            <p className="mt-1 text-xs text-neutral-600">
              We&apos;ll send your confirmation and tracking link by email and SMS.
            </p>
            <div className="mt-4 space-y-2">
              <Label htmlFor="guest-email">Email for order updates *</Label>
              <Input
                id="guest-email"
                type="email"
                value={guestEmail}
                onChange={(e) => onGuestEmailChange(e.target.value)}
                placeholder="you@example.com"
                required
              />
              {errors.guestEmail && (
                <p className="text-sm text-destructive">{errors.guestEmail}</p>
              )}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Have an account?{" "}
              <Link href="/account?tab=login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        )}

        {isAuthenticated && !isPickup && savedAddresses.length > 0 && (
          <div className="mb-6 space-y-2">
            <p className="text-sm font-medium">Saved addresses</p>
            {savedAddresses.map((addr) => (
              <button
                key={addr.id}
                type="button"
                onClick={() => onUseSavedAddress?.(addr)}
                className="w-full rounded-lg border border-border p-3 text-left text-sm transition-colors hover:border-primary hover:bg-primary/5"
              >
                <span className="font-medium">{addr.label ?? "Address"}</span>
                <p className="mt-1 text-muted-foreground">
                  {addr.addressLine1 ?? addr.address_line1}, {addr.city}
                </p>
              </button>
            ))}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name *</Label>
            <Input
              id="fullName"
              value={address.fullName}
              onChange={(e) =>
                onAddressChange({ ...address, fullName: e.target.value })
              }
              required
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone for SMS updates *</Label>
            <Input
              id="phone"
              type="tel"
              value={address.phone}
              onChange={(e) =>
                onAddressChange({ ...address, phone: e.target.value })
              }
              placeholder="0XX XXX XXXX"
              required
            />
            <p className="text-xs text-muted-foreground">
              Ghana number — we&apos;ll text {isPickup ? "pickup" : "order"} updates here.
            </p>
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>

          {!isPickup && (
            <>
              <div className="space-y-2">
                <Label htmlFor="addressLine1">Address line 1 *</Label>
                <Input
                  id="addressLine1"
                  value={address.addressLine1}
                  onChange={(e) =>
                    onAddressChange({ ...address, addressLine1: e.target.value })
                  }
                  required
                />
                {errors.addressLine1 && (
                  <p className="text-sm text-destructive">{errors.addressLine1}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressLine2">Address line 2</Label>
                <Input
                  id="addressLine2"
                  value={address.addressLine2 ?? ""}
                  onChange={(e) =>
                    onAddressChange({ ...address, addressLine2: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={address.city}
                    onChange={(e) =>
                      onAddressChange({ ...address, city: e.target.value })
                    }
                    required
                  />
                  {errors.city && (
                    <p className="text-sm text-destructive">{errors.city}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State / region</Label>
                  <Input
                    id="state"
                    value={address.state ?? ""}
                    onChange={(e) =>
                      onAddressChange({ ...address, state: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <select
                  id="country"
                  value={address.country}
                  onChange={(e) =>
                    onAddressChange({ ...address, country: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <Button type="submit" className="w-full">
            Continue to payment
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
