import { create } from 'zustand'
import { ShippingAddress } from '@/store/orderStore'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useAuthStore } from './authStore'

interface AddressStore {
  addresses: Array<ShippingAddress & { id: string; label: string; isDefault: boolean }>
  loading: boolean
  initializeAddresses: () => Promise<void>
  addAddress: (address: Omit<ShippingAddress & { label: string }, 'id' | 'isDefault'>) => Promise<boolean>
  updateAddress: (id: string, address: Partial<ShippingAddress & { label: string }>) => Promise<boolean>
  deleteAddress: (id: string) => Promise<boolean>
  setDefaultAddress: (id: string) => Promise<boolean>
  getDefaultAddress: () => (ShippingAddress & { id: string; label: string }) | null
}

export const useAddressStore = create<AddressStore>()((set, get) => ({
      addresses: [],
      loading: false,
      
      initializeAddresses: async () => {
        if (!isSupabaseConfigured()) {
          console.error('Supabase is not configured.')
          return
        }
        
        const { user, isAuthenticated } = useAuthStore.getState()
        
        if (!isAuthenticated || !user) {
          return
        }
        
        try {
          set({ loading: true })
          
          // Fetch addresses from Supabase
          const { data, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', user.id)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: false })
          
          if (error) {
            console.error('Error fetching addresses:', error)
            set({ loading: false })
            return
          }
          
          if (data) {
            // Convert to address format
            const addresses = (data || [])
              .filter((addr: any) => addr && addr.id)
              .map((addr: any) => ({
                id: addr.id || '',
                label: addr.label || 'Address',
                fullName: addr.full_name || '',
                phone: addr.phone || '',
                addressLine1: addr.address_line1 || '',
                addressLine2: addr.address_line2 || undefined,
                city: addr.city || '',
                state: addr.state || undefined,
                country: addr.country || 'Ghana',
                isDefault: Boolean(addr.is_default),
              }))
            
            set({ addresses, loading: false })
          } else {
            set({ loading: false })
          }
        } catch (error) {
          console.error('Error initializing addresses:', error)
          set({ loading: false })
        }
      },
      
      addAddress: async (address) => {
        const { user, isAuthenticated } = useAuthStore.getState()
        const isFirstAddress = get().addresses.length === 0
        
        // If authenticated and Supabase configured, save to database
        if (isAuthenticated && user && isSupabaseConfigured()) {
          try {
            // If this is the first address or it's set as default, unset other defaults
            if (isFirstAddress) {
              await supabase
                .from('addresses')
                .update({ is_default: false })
                .eq('user_id', user.id)
            }
            
            // Let Supabase generate the UUID
            const { data, error } = await supabase
              .from('addresses')
              .insert({
                user_id: user.id,
                label: address.label,
                full_name: address.fullName,
                phone: address.phone,
                address_line1: address.addressLine1,
                address_line2: address.addressLine2 || null,
                city: address.city,
                state: address.state || null,
                country: address.country || 'Ghana',
                is_default: isFirstAddress,
              })
              .select()
              .single()
            
            if (error) {
              console.error('Error adding address:', error)
              return false
            }
            
            // Create newAddress with database ID
            const newAddress = {
              ...address,
              id: data.id,
              isDefault: isFirstAddress,
            }
          } catch (error) {
            console.error('Error adding address:', error)
            return false
          }
        }
        
        // Update local state
        const addresses = get().addresses || []
        set({ addresses: [...addresses, newAddress] })
        return true
      },
      
      updateAddress: async (id, updates) => {
        const { user, isAuthenticated } = useAuthStore.getState()
        
        // If authenticated and Supabase configured, update in database
        if (isAuthenticated && user && isSupabaseConfigured()) {
          try {
            const updateData: any = {}
            if (updates.label) updateData.label = updates.label
            if (updates.fullName) updateData.full_name = updates.fullName
            if (updates.phone) updateData.phone = updates.phone
            if (updates.addressLine1) updateData.address_line1 = updates.addressLine1
            if (updates.addressLine2 !== undefined) updateData.address_line2 = updates.addressLine2 || null
            if (updates.city) updateData.city = updates.city
            if (updates.state !== undefined) updateData.state = updates.state || null
            if (updates.country) updateData.country = updates.country
            
            const { error } = await supabase
              .from('addresses')
              .update(updateData)
              .eq('id', id)
              .eq('user_id', user.id)
            
            if (error) {
              console.error('Error updating address:', error)
              return false
            }
          } catch (error) {
            console.error('Error updating address:', error)
            return false
          }
        }
        
        // Update local state
        const addresses = get().addresses || []
        set({
          addresses: addresses.map((addr) =>
            addr && addr.id === id ? { ...addr, ...updates } : addr
          ),
        })
        return true
      },
      
      deleteAddress: async (id) => {
        const { user, isAuthenticated } = useAuthStore.getState()
        
        // If authenticated and Supabase configured, delete from database
        if (isAuthenticated && user && isSupabaseConfigured()) {
          try {
            const { error } = await supabase
              .from('addresses')
              .delete()
              .eq('id', id)
              .eq('user_id', user.id)
            
            if (error) {
              console.error('Error deleting address:', error)
              return false
            }
          } catch (error) {
            console.error('Error deleting address:', error)
            return false
          }
        }
        
        // Update local state
        const addresses = get().addresses || []
        set({ addresses: addresses.filter((addr) => addr && addr.id !== id) })
        return true
      },
      
      setDefaultAddress: async (id) => {
        const { user, isAuthenticated } = useAuthStore.getState()
        
        // If authenticated and Supabase configured, update in database
        if (isAuthenticated && user && isSupabaseConfigured()) {
          try {
            // First, unset all defaults for this user
            await supabase
              .from('addresses')
              .update({ is_default: false })
              .eq('user_id', user.id)
            
            // Then set this address as default
            const { error } = await supabase
              .from('addresses')
              .update({ is_default: true })
              .eq('id', id)
              .eq('user_id', user.id)
            
            if (error) {
              console.error('Error setting default address:', error)
              return false
            }
          } catch (error) {
            console.error('Error setting default address:', error)
            return false
          }
        }
        
        // Update local state
        const addresses = get().addresses || []
        set({
          addresses: addresses.map((addr) => ({
            ...addr,
            isDefault: addr && addr.id === id,
          })),
        })
        return true
      },
      
      getDefaultAddress: () => {
        const addresses = get().addresses || []
        return addresses.find((addr) => addr && addr.isDefault) || addresses[0] || null
      },
    })
  )

// Initialize addresses when user logs in
if (typeof window !== 'undefined') {
  useAuthStore.subscribe(
    (state) => state.isAuthenticated,
    (isAuthenticated) => {
      if (isAuthenticated) {
        useAddressStore.getState().initializeAddresses()
      }
    }
  )
}
