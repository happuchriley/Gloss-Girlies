import { create } from 'zustand'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useAuthStore } from './authStore'
import { useProductStore } from './productStore'

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

interface CartStore {
  items: CartItem[]
  loading: boolean
  initializeCart: () => Promise<void>
  addItem: (item: Omit<CartItem, 'quantity'>) => Promise<void>
  removeItem: (id: string) => Promise<void>
  updateQuantity: (id: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()((set, get) => ({
      items: [],
      loading: false,
      
      initializeCart: async () => {
        const { user, isAuthenticated } = useAuthStore.getState()
        
        if (!isAuthenticated || !user) {
          // Keep local cart items for unauthenticated users
          return
        }
        
        if (!isSupabaseConfigured()) {
          console.error('Supabase is not configured.')
          return
        }
        
        try {
          set({ loading: true })
          
          // Fetch cart items from Supabase
          const { data, error } = await supabase
            .from('cart_items')
            .select(`
              *,
              products:product_id (
                id,
                name,
                price,
                image
              )
            `)
            .eq('user_id', user.id)
          
          if (error) {
            console.error('Error fetching cart:', error)
            set({ loading: false })
            return
          }
          
          if (data) {
            // Convert to CartItem format
            const items: CartItem[] = (data || [])
              .filter((item: any) => item && item.products && item.product_id) // Filter out items with deleted products
              .map((item: any) => ({
                id: item.product_id || '',
                name: item.products?.name || 'Unknown Product',
                price: Number(item.products?.price) || 0,
                image: item.products?.image || '',
                quantity: Number(item.quantity) || 1,
              }))
            
            set({ items, loading: false })
          } else {
            set({ loading: false })
          }
        } catch (error) {
          console.error('Error initializing cart:', error)
          set({ loading: false })
        }
      },
      
      addItem: async (item) => {
        const { user, isAuthenticated, isAdmin } = useAuthStore.getState()
        
        // Prevent admins from adding items to cart
        if (isAdmin) {
          console.warn('Admin accounts cannot add items to cart')
          alert('Admin accounts cannot make purchases. Please use a regular customer account.')
          return
        }
        
        const items = get().items
        const existingItem = items.find((i) => i.id === item.id)
        
        let newItems: CartItem[]
        
        if (existingItem) {
          newItems = items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          )
        } else {
          newItems = [...items, { ...item, quantity: 1 }]
        }
        
        // Update local state immediately for better UX
        set({ items: newItems })
        
        // If not authenticated, just store locally (will sync on login)
        if (!isAuthenticated || !user) {
          return
        }
        
        if (!isSupabaseConfigured()) {
          console.error('Supabase is not configured.')
          return
        }
        
        try {
          // First, verify the product exists in the database
          const { data: product, error: productError } = await supabase
            .from('products')
            .select('id')
            .eq('id', item.id)
            .maybeSingle()
          
          if (productError && productError.code !== 'PGRST116') {
            console.error('Error checking product:', productError)
            return
          }
          
          if (!product) {
            console.warn(`Product ${item.id} does not exist in database. Item added to local cart only.`)
            return
          }
          
          const newQuantity = existingItem ? existingItem.quantity + 1 : 1
            
          // Check if item already exists in cart
          const { data: existing, error: checkError } = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', user.id)
            .eq('product_id', item.id)
            .maybeSingle()
          
          if (checkError && checkError.code !== 'PGRST116') {
            console.error('Error checking cart item:', checkError)
            return
          }
          
          if (existing) {
            // Update quantity
            const { error: updateError } = await supabase
              .from('cart_items')
              .update({ quantity: newQuantity })
              .eq('id', existing.id)
            
            if (updateError) {
              console.error('Error updating cart item:', updateError)
              // Revert local state on error
              set({ items })
              return
            }
          } else {
            // Insert new item
            const { error: insertError } = await supabase
              .from('cart_items')
              .insert({
                user_id: user.id,
                product_id: item.id,
                quantity: 1,
              })
            
            if (insertError) {
              console.error('Error inserting cart item:', insertError)
              // Revert local state on error
              set({ items })
              return
            }
          }
        } catch (error) {
          console.error('Error syncing cart to database:', error)
          // Revert local state on error
          set({ items })
        }
      },
      
      removeItem: async (id) => {
        if (!isSupabaseConfigured()) {
          console.error('Supabase is not configured.')
          return
        }
        
        const { user, isAuthenticated } = useAuthStore.getState()
        
        if (!isAuthenticated || !user) {
          return
        }
        
        try {
          const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', id)
          
          if (error) {
            console.error('Error removing cart item from database:', error)
            return
          }
          
          // Update local state only if database operation succeeded
          const newItems = get().items.filter((item) => item.id !== id)
          set({ items: newItems })
        } catch (error) {
          console.error('Error removing cart item from database:', error)
        }
      },
      
      updateQuantity: async (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        
        if (!isSupabaseConfigured()) {
          console.error('Supabase is not configured.')
          return
        }
        
        const { user, isAuthenticated } = useAuthStore.getState()
        
        if (!isAuthenticated || !user) {
          return
        }
        
        try {
          const { data: existing, error: checkError } = await supabase
            .from('cart_items')
            .select('id')
            .eq('user_id', user.id)
            .eq('product_id', id)
            .single()
          
          if (checkError && checkError.code !== 'PGRST116') {
            console.error('Error checking cart item:', checkError)
            return
          }
          
          if (existing) {
            const { error: updateError } = await supabase
              .from('cart_items')
              .update({ quantity })
              .eq('id', existing.id)
            
            if (updateError) {
              console.error('Error updating cart quantity:', updateError)
              return
            }
          }
          
          // Update local state only if database operation succeeded
          const newItems = get().items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          )
          set({ items: newItems })
        } catch (error) {
          console.error('Error updating cart quantity in database:', error)
        }
      },
      
      clearCart: async () => {
        if (!isSupabaseConfigured()) {
          console.error('Supabase is not configured.')
          set({ items: [] })
          return
        }
        
        const { user, isAuthenticated } = useAuthStore.getState()
        
        if (isAuthenticated && user && isSupabaseConfigured()) {
          try {
            const { error } = await supabase
              .from('cart_items')
              .delete()
              .eq('user_id', user.id)
            
            if (error) {
              console.error('Error clearing cart in database:', error)
              return
            }
          } catch (error) {
            console.error('Error clearing cart in database:', error)
            return
          }
        }
        
        // Update local state only if database operation succeeded or user not authenticated
        set({ items: [] })
      },
      
      getTotal: () => {
        const items = get().items || []
        return items.reduce((total, item) => {
          const price = Number(item.price) || 0
          const quantity = Number(item.quantity) || 0
          return total + price * quantity
        }, 0)
      },
      
      getItemCount: () => {
        const items = get().items || []
        return items.reduce((count, item) => {
          const quantity = Number(item.quantity) || 0
          return count + quantity
        }, 0)
      },
    })
  )

// Initialize cart when user logs in
if (typeof window !== 'undefined') {
  // Listen for auth state changes
  let previousAuthState: boolean | null = null
  
  useAuthStore.subscribe(
    (state) => {
      const currentAuthState = state.isAuthenticated
      
      // Only act on state changes, not initial state
      if (previousAuthState === null) {
        previousAuthState = currentAuthState
        return
      }
      
      if (currentAuthState && !previousAuthState) {
        // User logged in - sync local cart to database and fetch from database
        const localItems = useCartStore.getState().items
        useCartStore.getState().initializeCart().then(() => {
          // After fetching from database, sync local items if any
          if (localItems.length > 0) {
            const { user } = useAuthStore.getState()
            if (user && isSupabaseConfigured()) {
              // Sync local items to database
              Promise.all(localItems.map(async (item) => {
                try {
                  // Check if product exists
                  const { data: product } = await supabase
                    .from('products')
                    .select('id')
                    .eq('id', item.id)
                    .maybeSingle()
                  
                  if (product) {
                    // Check if already in cart
                    const { data: existing } = await supabase
                      .from('cart_items')
                      .select('*')
                      .eq('user_id', user.id)
                      .eq('product_id', item.id)
                      .maybeSingle()
                    
                    if (existing) {
                      await supabase
                        .from('cart_items')
                        .update({ quantity: item.quantity })
                        .eq('id', existing.id)
                    } else {
                      await supabase
                        .from('cart_items')
                        .insert({
                          user_id: user.id,
                          product_id: item.id,
                          quantity: item.quantity,
                        })
                    }
                  }
                } catch (error) {
                  console.error('Error syncing cart item:', error)
                }
              })).then(() => {
                // Re-initialize to get merged cart
                useCartStore.getState().initializeCart()
              })
            }
          }
        })
      } else if (!currentAuthState && previousAuthState) {
        // User logged out - keep local cart items (don't clear)
        // The logout function already handles database cleanup
      }
      
      previousAuthState = currentAuthState
    }
  )
}
