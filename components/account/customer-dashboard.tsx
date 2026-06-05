"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Heart,
  HelpCircle,
  Package,
  Pencil,
  Save,
  Shield,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react"

import { AccountShell } from "@/components/account/account-shell"
import {
  ACCOUNT_QUICK_LINKS,
  buildAccountNav,
  type AccountSection,
} from "@/components/account/account-nav"
import { OrderStatusBadge } from "@/components/admin/order-status-badge"
import { PageTransition } from "@/components/layout/page-transition"
import { toast } from "@/lib/toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatDate } from "@/lib/dateUtils"
import { formatPrice } from "@/lib/products/format"
import type { User } from "@/store/authStore"
import type { Order } from "@/store/orderStore"

interface ProfileFormData {
  name: string
  email: string
  phone: string
  marketingOptIn: boolean
}

interface PasswordFormData {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export interface CustomerDashboardProps {
  user: User
  orders: Order[]
  wishlistCount?: number
  preview?: boolean
  onProfileUpdate?: (data: ProfileFormData) => Promise<boolean>
  onPasswordChange?: (data: PasswordFormData) => Promise<{ ok: boolean; error?: string }>
  onDeleteAccount?: () => Promise<boolean>
  onLogout?: () => void
}

export function CustomerDashboard({
  user,
  orders,
  wishlistCount = 0,
  preview = false,
  onProfileUpdate,
  onPasswordChange,
  onDeleteAccount,
  onLogout,
}: CustomerDashboardProps) {
  const [activeSection, setActiveSection] = useState<AccountSection>("overview")
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    marketingOptIn: user.marketingOptIn ?? false,
  })
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const navItems = buildAccountNav(orders.length)
  const recentOrders = orders.slice(0, 3)
  const activeOrders = orders.filter((o) => !["delivered", "cancelled"].includes(o.status))

  const flash = (message: string) => {
    toast.success(message)
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (preview || !onProfileUpdate) return
    setError("")
    setLoading(true)
    try {
      const ok = await onProfileUpdate(profileData)
      if (ok) {
        flash("Profile updated successfully!")
        setIsEditing(false)
      } else {
        setError("Failed to update profile")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (preview || !onPasswordChange) return
    setError("")
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match")
      return
    }
    if (passwordData.newPassword.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }
    setLoading(true)
    try {
      const result = await onPasswordChange(passwordData)
      if (result.ok) {
        flash("Password changed successfully!")
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" })
      } else {
        setError(result.error || "Failed to change password")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (preview || !onDeleteAccount) return
    if (
      !confirm(
        "Delete your account? This permanently removes your profile, orders, and saved data."
      )
    )
      return
    if (!confirm("This cannot be undone. Are you absolutely sure?")) return
    setLoading(true)
    setError("")
    try {
      const ok = await onDeleteAccount()
      if (!ok) setError("Failed to delete account. Admin accounts cannot be deleted.")
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <AccountShell
        userName={user.name}
        userEmail={user.email}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        navItems={navItems}
        onLogout={onLogout}
        preview={preview}
      >
        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {activeSection === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Total orders" value={String(orders.length)} icon={Package} />
              <StatCard label="Active orders" value={String(activeOrders.length)} icon={ShoppingBag} />
              <StatCard label="Saved items" value={String(wishlistCount)} icon={Heart} />
            </div>

            <div>
              <h2 className="mb-3 font-display text-lg text-ink">Quick links</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {ACCOUNT_QUICK_LINKS.map(({ href, label, description, icon: Icon }) => (
                  <Link key={href} href={href} className="group">
                    <Card className="h-full rounded-2xl border-pink-100 transition-all hover:border-pink-300 hover:shadow-md hover:shadow-pink-100/50">
                      <CardContent className="flex items-center justify-between p-5">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-pink-100 p-2.5">
                            <Icon className="h-4 w-4 text-pink-600" />
                          </div>
                          <div>
                            <p className="font-medium text-ink">{label}</p>
                            <p className="text-xs text-neutral-500">{description}</p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-pink-400 transition-transform group-hover:translate-x-0.5" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
                <Link href="/help" className="group">
                  <Card className="h-full rounded-2xl border-pink-100 transition-all hover:border-pink-300">
                    <CardContent className="flex items-center justify-between p-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-pink-100 p-2.5">
                          <HelpCircle className="h-4 w-4 text-pink-600" />
                        </div>
                        <div>
                          <p className="font-medium text-ink">Help center</p>
                          <p className="text-xs text-neutral-500">FAQs & contact</p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-pink-400" />
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>

            <Card className="overflow-hidden rounded-2xl border-pink-100">
              <CardHeader className="flex flex-row items-center justify-between border-b border-pink-100 bg-pink-50/30">
                <div>
                  <CardTitle className="font-display text-lg">Recent orders</CardTitle>
                  <CardDescription>Your latest purchases</CardDescription>
                </div>
                <Button variant="link" className="text-pink-600" asChild>
                  <Link href="/orders">View all</Link>
                </Button>
              </CardHeader>
              <CardContent className="divide-y divide-pink-50 p-0">
                {recentOrders.length === 0 ? (
                  <div className="px-6 py-10 text-center">
                    <Package className="mx-auto h-10 w-10 text-pink-300" />
                    <p className="mt-3 text-sm text-neutral-500">No orders yet</p>
                    <Button className="mt-4 rounded-full bg-pink-600 hover:bg-pink-500" asChild>
                      <Link href="/categories">Start shopping</Link>
                    </Button>
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={preview ? "#" : `/orders/${order.id}`}
                      className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 transition-colors hover:bg-pink-50/40"
                    >
                      <div>
                        <p className="font-mono text-sm text-pink-700">{order.id}</p>
                        <p className="text-xs text-neutral-500">
                          {formatDate(order.createdAt)} · {order.items.length} item
                          {order.items.length === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{formatPrice(order.total)}</span>
                        <OrderStatusBadge status={order.status} />
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === "orders" && (
          <Card className="rounded-2xl border-pink-100">
            <CardHeader className="border-b border-pink-100 bg-pink-50/30">
              <CardTitle className="font-display text-xl">Order history</CardTitle>
              <CardDescription>
                {orders.length} order{orders.length === 1 ? "" : "s"} on your account
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-pink-50 p-0">
              {orders.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Package className="mx-auto h-10 w-10 text-pink-300" />
                  <p className="mt-3 text-sm text-neutral-500">No orders yet</p>
                  <Button className="mt-4 rounded-full bg-pink-600 hover:bg-pink-500" asChild>
                    <Link href="/categories">Start shopping</Link>
                  </Button>
                </div>
              ) : (
                orders.map((order) => (
                  <Link
                    key={order.id}
                    href={preview ? "#" : `/orders/${order.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 transition-colors hover:bg-pink-50/40"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-ink">Order {order.id}</p>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="mt-1 text-xs text-neutral-500">
                        {formatDate(order.createdAt)} · {order.items.length} item
                        {order.items.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-pink-700">
                      {formatPrice(order.total)}
                    </p>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {activeSection === "profile" && (
          <Card className="rounded-2xl border-pink-100">
            <CardHeader className="flex flex-row items-center justify-between border-b border-pink-100 bg-pink-50/30">
              <div>
                <CardTitle className="font-display text-xl">Profile</CardTitle>
                <CardDescription>Your personal details</CardDescription>
              </div>
              {!isEditing && !preview && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full border-pink-200"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              {isEditing ? (
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="profileName">Full name</Label>
                    <Input
                      id="profileName"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="rounded-xl border-pink-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profileEmail">Email</Label>
                    <Input
                      id="profileEmail"
                      type="email"
                      value={profileData.email}
                      readOnly
                      className="rounded-xl border-pink-200 bg-pink-50/50"
                    />
                    <p className="text-xs text-neutral-500">
                      {user.emailVerified ? "Verified" : "Not verified — check your inbox"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profilePhone">
                      Phone <span className="text-pink-600">*</span>
                    </Label>
                    <Input
                      id="profilePhone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="0XX XXX XXXX"
                      className="rounded-xl border-pink-200"
                      required
                    />
                    <p className="text-xs text-neutral-500">
                      Required for order and delivery SMS updates.
                    </p>
                  </div>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-pink-100 bg-pink-50/40 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={profileData.marketingOptIn}
                      onChange={(e) =>
                        setProfileData({ ...profileData, marketingOptIn: e.target.checked })
                      }
                      className="mt-0.5 h-4 w-4 rounded border-pink-300 text-pink-600"
                    />
                    <span className="text-sm text-neutral-600">
                      Marketing updates (email & SMS)
                    </span>
                  </label>
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 rounded-full bg-pink-600 hover:bg-pink-500"
                    >
                      <Save className="h-4 w-4" />
                      {loading ? "Saving…" : "Save"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full border-pink-200"
                      onClick={() => {
                        setIsEditing(false)
                        setProfileData({
                          name: user.name,
                          email: user.email,
                          phone: user.phone || "",
                          marketingOptIn: user.marketingOptIn ?? false,
                        })
                        setError("")
                      }}
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoTile label="Full name" value={user.name} />
                  <InfoTile label="Email" value={user.email} />
                  <InfoTile
                    label="Email status"
                    value={user.emailVerified ? "Verified" : "Pending verification"}
                  />
                  <InfoTile label="Phone" value={user.phone || "—"} />
                  <InfoTile
                    label="Marketing"
                    value={user.marketingOptIn ? "Opted in" : "Opted out"}
                  />
                  <InfoTile
                    label="Account type"
                    value={user.role === "admin" ? "Administrator" : "Customer"}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeSection === "security" && (
          <Card className="rounded-2xl border-pink-100">
            <CardHeader className="border-b border-pink-100 bg-pink-50/30">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-pink-600" />
                <div>
                  <CardTitle className="font-display text-xl">Security</CardTitle>
                  <CardDescription>Update your password</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {preview ? (
                <div className="space-y-4 opacity-60">
                  <p className="text-sm text-neutral-500">Password change (preview only)</p>
                  <div className="h-10 rounded-xl bg-pink-50" />
                  <div className="h-10 rounded-xl bg-pink-50" />
                  <Button disabled className="rounded-full">
                    Change password
                  </Button>
                </div>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="oldPassword">Current password</Label>
                    <Input
                      id="oldPassword"
                      type="password"
                      value={passwordData.oldPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, oldPassword: e.target.value })
                      }
                      className="rounded-xl border-pink-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      className="rounded-xl border-pink-200"
                      required
                      minLength={8}
                    />
                    <p className="text-xs text-neutral-500">
                      At least 8 characters with letters and numbers
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                      className="rounded-xl border-pink-200"
                      required
                      minLength={6}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="rounded-full bg-pink-600 hover:bg-pink-500"
                  >
                    {loading ? "Changing…" : "Change password"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        {activeSection === "danger" && (
          <Card className="rounded-2xl border-red-200">
            <CardHeader className="border-b border-red-100 bg-red-50/50">
              <CardTitle className="font-display text-xl text-red-900">Delete account</CardTitle>
              <CardDescription className="text-red-700/80">
                Permanently remove your profile and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-neutral-600">
                This removes your orders, wishlist, and profile. This action cannot be undone.
              </p>
              <Button
                type="button"
                variant="destructive"
                className="mt-4 rounded-full"
                onClick={handleDelete}
                disabled={loading || preview || user.role === "admin"}
              >
                <Trash2 className="h-4 w-4" />
                {preview ? "Disabled in preview" : loading ? "Deleting…" : "Delete my account"}
              </Button>
              {user.role === "admin" && (
                <p className="mt-2 text-xs text-neutral-500">Admin accounts cannot be deleted</p>
              )}
            </CardContent>
          </Card>
        )}
      </AccountShell>
    </PageTransition>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card className="rounded-2xl border-pink-100">
      <CardContent className="flex items-center justify-between pt-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-neutral-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
        </div>
        <div className="rounded-full bg-pink-100 p-2.5">
          <Icon className="h-5 w-5 text-pink-600" />
        </div>
      </CardContent>
    </Card>
  )
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-pink-100 bg-pink-50/40 p-4">
      <p className="text-xs text-pink-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-ink">{value}</p>
    </div>
  )
}
