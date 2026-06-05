"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  LayoutDashboard,
  LogOut,
  PackageCheck,
  Save,
  Shield,
  User,
} from "lucide-react"

import { adminUi } from "@/components/admin/admin-ui"
import { LogoutConfirm } from "@/components/feedback/logout-confirm"
import { toast } from "@/lib/toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { User as AuthUser } from "@/store/authStore"

type AdminProfileSection = "home" | "settings" | "security"

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

export interface AdminProfileViewProps {
  user: AuthUser
  stats: {
    orders: number
    toFulfill: number
    lowStock: number
  }
  onProfileUpdate?: (data: ProfileFormData) => Promise<boolean>
  onPasswordChange?: (data: PasswordFormData) => Promise<{ ok: boolean; error?: string }>
  onSignOut?: () => Promise<void> | void
}

export function AdminProfileView({
  user,
  stats,
  onProfileUpdate,
  onPasswordChange,
  onSignOut,
}: AdminProfileViewProps) {
  const [activeSection, setActiveSection] = useState<AdminProfileSection>("home")
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

  const flash = (message: string) => {
    toast.success(message)
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!onProfileUpdate) return
    setError("")
    setLoading(true)
    try {
      const ok = await onProfileUpdate(profileData)
      if (ok) {
        flash("Profile updated.")
        setIsEditing(false)
      } else {
        setError("Failed to update profile.")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!onPasswordChange) return
    setError("")
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match.")
      return
    }
    if (passwordData.newPassword.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    setLoading(true)
    try {
      const result = await onPasswordChange(passwordData)
      if (result.ok) {
        flash("Password changed.")
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" })
      } else {
        setError(result.error || "Failed to change password.")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <Card className="surface-card mb-6">
        <CardContent className="pt-8">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-brand text-4xl font-semibold text-white shadow">
            {user.name
              .split(" ")
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase() ?? "")
              .join("")}
          </div>
          <p className="label-editorial mt-4 text-center">Store Admin</p>
          <h1 className="mt-1 text-center font-display text-4xl text-ink">{user.name}</h1>
          <p className="mt-1 text-center text-sm text-neutral-500">{user.email}</p>

          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-neutral-200 pt-5 text-center">
            <Stat label="Orders" value={stats.orders} />
            <Stat label="To Fulfill" value={stats.toFulfill} />
            <Stat label="Low Stock" value={stats.lowStock} />
          </div>
        </CardContent>
      </Card>

      {activeSection === "home" && (
        <div className="space-y-4">
          <ActionRow
            icon={LayoutDashboard}
            title="Store dashboard"
            description="Products, inventory, and orders"
            href="/admin"
          />
          <ActionRow
            icon={Shield}
            title="Settings"
            description="Profile and security"
            onClick={() => {
              setActiveSection("settings")
              setIsEditing(false)
            }}
          />

          <Card className="surface-card">
            <CardContent className="pt-5">
              <div className="flex items-start gap-3">
                <div className="rounded-full border border-neutral-200 p-2">
                  <LogOut className="h-4 w-4 text-neutral-500" />
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-ink">Sign out of your account</p>
                  <p className="text-sm text-neutral-500">
                    Your bag is saved on this device. Sign back in anytime to pick up where you left off.
                  </p>
                </div>
              </div>
              <LogoutConfirm
                onLogout={() => onSignOut?.()}
                trigger={(open) => (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-5 w-full rounded-none border-neutral-200 uppercase tracking-[0.2em]"
                    onClick={open}
                  >
                    Sign out
                  </Button>
                )}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {activeSection === "settings" && (
        <Card className="surface-card">
          <CardContent className="pt-6">
            {!isEditing ? (
              <div className="space-y-4">
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
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value=""
                    className="hidden"
                    aria-hidden
                  />
                  <Button
                    type="button"
                    className="rounded-md bg-brand text-white hover:bg-brand-dark"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit profile
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-md border-neutral-300"
                    onClick={() => {
                      setActiveSection("security")
                    }}
                  >
                    Security
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProfileSubmit} className="max-w-lg space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adminProfileName">Full name</Label>
                  <Input
                    id="adminProfileName"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="rounded-md border-neutral-300"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminProfileEmail">Email</Label>
                  <Input
                    id="adminProfileEmail"
                    type="email"
                    value={profileData.email}
                    readOnly
                    className="rounded-md border-neutral-300 bg-neutral-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminProfilePhone">
                    Phone <span className="text-brand">*</span>
                  </Label>
                  <Input
                    id="adminProfilePhone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="0XX XXX XXXX"
                    className="rounded-md border-neutral-300"
                    required
                  />
                </div>
                <label className="flex cursor-pointer items-start gap-3 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={profileData.marketingOptIn}
                    onChange={(e) =>
                      setProfileData({ ...profileData, marketingOptIn: e.target.checked })
                    }
                    className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-black"
                  />
                  <span className="text-sm text-neutral-600">
                    Marketing updates (email & SMS)
                  </span>
                </label>
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="rounded-md bg-brand text-white hover:bg-brand-dark"
                  >
                    <Save className="h-4 w-4" />
                    {loading ? "Saving…" : "Save"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-md border-neutral-300"
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
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {activeSection === "security" && (
        <Card className="surface-card">
          <CardContent className="pt-6">
            <p className="mb-4 text-sm text-neutral-500">Change your admin account password.</p>
            <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminOldPassword">Current password</Label>
                <Input
                  id="adminOldPassword"
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, oldPassword: e.target.value })
                  }
                  className="rounded-md border-neutral-300"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminNewPassword">New password</Label>
                <Input
                  id="adminNewPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  className="rounded-md border-neutral-300"
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminConfirmPassword">Confirm password</Label>
                <Input
                  id="adminConfirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  className="rounded-md border-neutral-300"
                  required
                  minLength={8}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-brand text-white hover:bg-brand-dark"
                >
                {loading ? "Changing…" : "Change password"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-md border-neutral-300"
                  onClick={() => setActiveSection("settings")}
                >
                  Back
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  )
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className={adminUi.infoTile}>
      <p className={adminUi.infoTileLabel}>{label}</p>
      <p className="mt-1 text-sm font-medium text-ink">{value}</p>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-2xl font-medium text-ink">{value}</p>
      <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">{label}</p>
    </div>
  )
}

function ActionRow({
  icon: Icon,
  title,
  description,
  href,
  onClick,
}: {
  icon: typeof User
  title: string
  description: string
  href?: string
  onClick?: () => void
}) {
  const body = (
    <>
      <div className="flex items-center gap-3">
        <div className="rounded-md border border-neutral-200 p-2">
          <Icon className="h-4 w-4 text-neutral-500" />
        </div>
        <div>
          <p className="font-medium text-ink">{title}</p>
          <p className="text-sm text-neutral-500">{description}</p>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-neutral-400" />
    </>
  )

  if (href) {
    return (
      <Link href={href} className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3">
        {body}
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 text-left"
    >
      {body}
    </button>
  )
}
