import { create } from 'zustand'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role?: 'admin' | 'user'
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  loading: boolean
  initialize: () => Promise<void>
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>
  register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>
  forgotPassword: (email: string) => Promise<boolean>
  resetPassword: (newPassword: string) => Promise<boolean>
  updateUser: (updates: Partial<User>) => Promise<boolean>
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>
  deleteAccount: () => Promise<boolean>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      loading: true,
      
      initialize: async () => {
        if (!isSupabaseConfigured()) {
          console.error('Supabase is not configured. Authentication will not work.')
          set({ loading: false })
          return
        }
        
        try {
          set({ loading: true })
          
          // Check for existing session
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session?.user) {
            // Get user profile from database
            const { data: profile, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
              console.error('Error fetching user profile:', error)
              set({ loading: false })
              return
            }
            
            if (profile) {
              set({
                user: {
                  id: profile.id,
                  name: profile.name,
                  email: profile.email,
                  phone: profile.phone || undefined,
                  role: profile.role,
                },
                isAuthenticated: true,
                isAdmin: profile.role === 'admin',
                loading: false,
              })
            } else {
              // User exists in auth but not in users table - create profile
              const { data: newProfile, error: createError } = await supabase
                .from('users')
                .insert({
                  id: session.user.id,
                  email: session.user.email || '',
                  name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                  role: 'user',
                })
                .select()
                .single()
              
              if (createError) {
                console.error('Error creating user profile:', createError)
                set({ loading: false })
                return
              }
              
              if (newProfile) {
                set({
                  user: {
                    id: newProfile.id,
                    name: newProfile.name,
                    email: newProfile.email,
                    phone: newProfile.phone || undefined,
                    role: newProfile.role,
                  },
                  isAuthenticated: true,
                  isAdmin: newProfile.role === 'admin',
                  loading: false,
                })
              }
            }
          } else {
            set({ loading: false })
          }
        } catch (error) {
          console.error('Error initializing auth:', error)
          set({ loading: false })
        }
      },
      
      login: async (email: string, password: string, rememberMe: boolean = false) => {
        if (!isSupabaseConfigured()) {
          console.error('Supabase is not configured. Please set up your environment variables.')
          return false
        }
        
        try {
          // Sign in with password
          // Sign in with Supabase
          // Note: Supabase handles session persistence internally
          // The rememberMe flag controls session duration
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          
          if (error) {
            console.error('Login error:', error.message)
            return false
          }
          
          if (data.user) {
            // Get user profile
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single()
            
            if (profileError && profileError.code !== 'PGRST116') {
              console.error('Error fetching user profile:', profileError)
              return false
            }
            
            if (profile) {
              set({
                user: {
                  id: profile.id,
                  name: profile.name,
                  email: profile.email,
                  phone: profile.phone || undefined,
                  role: profile.role,
                },
                isAuthenticated: true,
                isAdmin: profile.role === 'admin',
              })
              return true
            } else {
              // Create profile if it doesn't exist
              const { data: newProfile, error: createError } = await supabase
                .from('users')
                .insert({
                  id: data.user.id,
                  email: data.user.email || '',
                  name: data.user.user_metadata?.name || email.split('@')[0],
                  role: 'user',
                })
                .select()
                .single()
              
              if (createError) {
                console.error('Error creating user profile:', createError)
                return false
              }
              
              if (newProfile) {
                set({
                  user: {
                    id: newProfile.id,
                    name: newProfile.name,
                    email: newProfile.email,
                    phone: newProfile.phone || undefined,
                    role: newProfile.role,
                  },
                  isAuthenticated: true,
                  isAdmin: newProfile.role === 'admin',
                })
                return true
              }
            }
          }
          
          return false
        } catch (error) {
          console.error('Login error:', error)
          return false
        }
      },
      
      register: async (name: string, email: string, password: string, phone?: string) => {
        if (!isSupabaseConfigured()) {
          console.error('Supabase is not configured. Please set up your environment variables.')
          return false
        }
        
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name,
                phone,
              },
            },
          })
          
          if (error) {
            console.error('Registration error:', error.message)
            return false
          }
          
          if (data.user) {
            // Create user profile in database
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .insert({
                id: data.user.id,
                email: data.user.email || email,
                name,
                phone: phone || null,
                role: 'user',
              })
              .select()
              .single()
            
            if (profileError) {
              console.error('Error creating user profile:', profileError)
              // User is created in auth but profile creation failed
              // They can still log in and profile will be created on first login
              return false
            }
            
            if (profile) {
              set({
                user: {
                  id: profile.id,
                  name: profile.name,
                  email: profile.email,
                  phone: profile.phone || undefined,
                  role: profile.role,
                },
                isAuthenticated: true,
                isAdmin: false,
              })
              return true
            }
          }
          
          return false
        } catch (error) {
          console.error('Registration error:', error)
          return false
        }
      },
      
      updateUser: async (updates: Partial<User>) => {
        if (!isSupabaseConfigured()) {
          console.error('Supabase is not configured.')
          return false
        }
        
        const currentUser = get().user
        if (!currentUser) return false
        
        try {
          const updateData: any = {}
          if (updates.name) updateData.name = updates.name
          if (updates.phone !== undefined) updateData.phone = updates.phone || null
          
          const { error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', currentUser.id)
          
          if (error) {
            console.error('Error updating user:', error)
            return false
          }
          
          // Update local state
          set({
            user: { ...currentUser, ...updates },
          })
          
          return true
        } catch (error) {
          console.error('Error updating user:', error)
          return false
        }
      },
      
      changePassword: async (oldPassword: string, newPassword: string) => {
        if (!isSupabaseConfigured()) {
          console.error('Supabase is not configured.')
          return false
        }
        
        const currentUser = get().user
        if (!currentUser) return false
        
        try {
          // First verify old password by attempting to sign in
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: currentUser.email,
            password: oldPassword,
          })
          
          if (signInError) {
            return false
          }
          
          // Update password
          const { error } = await supabase.auth.updateUser({
            password: newPassword,
          })
          
          if (error) {
            console.error('Error updating password:', error)
            return false
          }
          
          return true
        } catch (error) {
          console.error('Error changing password:', error)
          return false
        }
      },
      
      forgotPassword: async (email: string) => {
        if (!isSupabaseConfigured()) {
          console.error('Supabase is not configured.')
          return false
        }
        
        try {
          // Send password reset email
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: typeof window !== 'undefined' 
              ? `${window.location.origin}/account/reset-password`
              : '/account/reset-password',
          })
          
          if (error) {
            console.error('Error sending password reset email:', error)
            return false
          }
          
          return true
        } catch (error) {
          console.error('Error in forgot password:', error)
          return false
        }
      },
      
      resetPassword: async (newPassword: string) => {
        if (!isSupabaseConfigured()) {
          console.error('Supabase is not configured.')
          return false
        }
        
        try {
          // Update password using the session from the reset link
          const { error } = await supabase.auth.updateUser({
            password: newPassword,
          })
          
          if (error) {
            console.error('Error resetting password:', error)
            return false
          }
          
          return true
        } catch (error) {
          console.error('Error in reset password:', error)
          return false
        }
      },
      
      deleteAccount: async () => {
        if (!isSupabaseConfigured()) {
          console.error('Supabase is not configured.')
          return false
        }
        
        const currentUser = get().user
        if (!currentUser) return false
        
        // Prevent admins from deleting their own account
        if (currentUser.role === 'admin') {
          console.error('Admins cannot delete their accounts.')
          return false
        }
        
        try {
          // Note: Regular users cannot delete their auth account directly
          // In production, you'd want a server-side function or edge function for this
          // For now, we'll delete the profile and sign them out
          // The auth account will remain but won't have a profile
          
          const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', currentUser.id)
          
          if (deleteError) {
            console.error('Error deleting user profile:', deleteError)
            return false
          }
          
          // Sign out and clear state
          await supabase.auth.signOut()
          set({ user: null, isAuthenticated: false, isAdmin: false })
          
          return true
        } catch (error) {
          console.error('Error deleting account:', error)
          return false
        }
      },
      
      logout: async () => {
        try {
          // Get user info before clearing auth state
          const currentUser = get().user
          const wasAuthenticated = get().isAuthenticated
          
          // Clear auth state FIRST to prevent any subscriptions from causing issues
          set({ user: null, isAuthenticated: false, isAdmin: false })
          
          // Clear cart from database in background (don't wait for it)
          if (wasAuthenticated && currentUser && isSupabaseConfigured()) {
            // Fire and forget - don't block logout
            supabase
              .from('cart_items')
              .delete()
              .eq('user_id', currentUser.id)
              .catch((error) => {
                console.error('Error clearing cart during logout (non-blocking):', error)
              })
          }
          
          // Sign out from Supabase (with timeout to prevent hanging)
          if (isSupabaseConfigured()) {
            const signOutPromise = supabase.auth.signOut()
            const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 2000))
            
            // Wait for signOut or timeout after 2 seconds
            await Promise.race([signOutPromise, timeoutPromise])
          }
        } catch (error) {
          console.error('Error logging out:', error)
          // State already cleared above, so we're good
        }
      },
    })
  )

// Initialize auth on store creation
if (typeof window !== 'undefined' && isSupabaseConfigured()) {
  useAuthStore.getState().initialize()
  
  // Listen for auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      useAuthStore.getState().logout()
    } else if (event === 'SIGNED_IN' && session?.user) {
      useAuthStore.getState().initialize()
    }
  })
}
