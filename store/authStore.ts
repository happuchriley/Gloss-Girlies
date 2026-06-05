import { create } from "zustand"

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role?: "admin" | "user"
  emailVerified?: boolean
  phoneVerified?: boolean
  marketingOptIn?: boolean
}

export interface AuthResult {
  success: boolean
  needsEmailVerification?: boolean
  error?: string
  user?: User
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  loading: boolean
  authError: string | null
  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<AuthResult>
  sendRegistrationOtp: (input: {
    phone: string
    email: string
  }) => Promise<
    | {
        success: true
        verificationId: string
        maskedPhone: string
        expiresAt: string
      }
    | { success: false; error: string }
  >
  register: (input: {
    name: string
    email: string
    password: string
    confirmPassword: string
    phone: string
    marketingOptIn: boolean
    verificationId: string
    otp: string
  }) => Promise<AuthResult>
  forgotPassword: (email: string) => Promise<AuthResult>
  resetPassword: (password: string, confirmPassword: string) => Promise<AuthResult>
  updateUser: (updates: {
    name: string
    phone: string
    marketingOptIn: boolean
  }) => Promise<boolean>
  changePassword: (
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => Promise<boolean>
  deleteAccount: () => Promise<boolean>
  logout: () => Promise<void>
  clearAuthError: () => void
}

function applyUser(set: (partial: Partial<AuthStore>) => void, user: User | null) {
  set({
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    loading: false,
    authError: null,
  })
}

async function authFetch<T>(
  path: string,
  init?: RequestInit
): Promise<{ ok: boolean; data: T; status: number }> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    credentials: "same-origin",
  })
  const data = (await res.json().catch(() => ({}))) as T
  return { ok: res.ok, data, status: res.status }
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  loading: true,
  authError: null,

  clearAuthError: () => set({ authError: null }),

  initialize: async () => {
    try {
      set({ loading: true })
      const { ok, data } = await authFetch<{ user: User | null }>(
        "/api/auth/session"
      )
      if (ok && data.user) {
        applyUser(set, data.user)
      } else {
        set({ user: null, isAuthenticated: false, isAdmin: false, loading: false })
      }
    } catch (error) {
      console.error("Error initializing auth:", error)
      set({ loading: false })
    }
  },

  login: async (email, password) => {
    try {
      const { ok, data } = await authFetch<{
        success?: boolean
        user?: User
        error?: string
      }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })

      if (!ok || !data.user) {
        const msg = data.error ?? "Sign in failed."
        set({ authError: msg })
        return { success: false, error: msg }
      }

      applyUser(set, data.user)
      return { success: true, user: data.user }
    } catch {
      return { success: false, error: "Something went wrong. Please try again." }
    }
  },

  sendRegistrationOtp: async (input) => {
    try {
      const { ok, data } = await authFetch<{
        success?: boolean
        verificationId?: string
        maskedPhone?: string
        expiresAt?: string
        error?: string
      }>("/api/auth/register/send-otp", {
        method: "POST",
        body: JSON.stringify(input),
      })

      if (!ok || !data.verificationId || !data.maskedPhone) {
        return {
          success: false,
          error: data.error ?? "Could not send verification code.",
        }
      }

      return {
        success: true,
        verificationId: data.verificationId,
        maskedPhone: data.maskedPhone,
        expiresAt: data.expiresAt ?? "",
      }
    } catch {
      return {
        success: false,
        error: "Something went wrong. Please try again.",
      }
    }
  },

  register: async (input) => {
    try {
      const { ok, data } = await authFetch<{
        success?: boolean
        needsEmailVerification?: boolean
        user?: User
        error?: string
      }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
      })

      if (!ok) {
        const msg = data.error ?? "Registration failed."
        set({ authError: msg })
        return { success: false, error: msg }
      }

      if (data.user) {
        applyUser(set, data.user)
      }

      return {
        success: true,
        needsEmailVerification: data.needsEmailVerification,
        user: data.user,
      }
    } catch {
      return { success: false, error: "Something went wrong. Please try again." }
    }
  },

  forgotPassword: async (email) => {
    try {
      const { ok, data } = await authFetch<{ success?: boolean; error?: string }>(
        "/api/auth/forgot-password",
        {
          method: "POST",
          body: JSON.stringify({ email }),
        }
      )

      if (!ok) {
        return { success: false, error: data.error ?? "Could not send reset email" }
      }

      return { success: true }
    } catch {
      return { success: false, error: "Something went wrong. Please try again." }
    }
  },

  resetPassword: async (password, confirmPassword) => {
    try {
      const { ok, data } = await authFetch<{ success?: boolean; error?: string }>(
        "/api/auth/reset-password",
        {
          method: "POST",
          body: JSON.stringify({ password, confirmPassword }),
        }
      )

      if (!ok) {
        return { success: false, error: data.error ?? "Could not reset password" }
      }

      return { success: true }
    } catch {
      return { success: false, error: "Something went wrong. Please try again." }
    }
  },

  updateUser: async (updates) => {
    const { ok, data } = await authFetch<{ success?: boolean; user?: User; error?: string }>(
      "/api/auth/profile",
      {
        method: "PATCH",
        body: JSON.stringify({
          name: updates.name,
          phone: updates.phone,
          marketingOptIn: updates.marketingOptIn,
        }),
      }
    )

    if (!ok || !data.user) {
      console.error("Profile update failed:", data.error)
      return false
    }

    set({ user: data.user })
    return true
  },

  changePassword: async (oldPassword, newPassword, confirmPassword) => {
    const { ok } = await authFetch("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
    })
    return ok
  },

  deleteAccount: async () => {
    const { ok } = await authFetch("/api/auth/delete", { method: "DELETE" })
    if (ok) {
      set({ user: null, isAuthenticated: false, isAdmin: false })
    }
    return ok
  },

  logout: async () => {
    set({ user: null, isAuthenticated: false, isAdmin: false, authError: null })
    try {
      await authFetch("/api/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("Error logging out:", error)
    }
  },
}))
