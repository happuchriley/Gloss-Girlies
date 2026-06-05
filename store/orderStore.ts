import { create } from 'zustand'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useAuthStore } from './authStore'
import { generateTrackingNumber, calculateEstimatedDelivery, sendOrderNotification } from '@/lib/notifications'
import { toastStatusSmsResult } from '@/lib/toast/sms-feedback'
import { generateGuestAccessToken, saveGuestOrderRef } from '@/lib/guest/session'
import type { FulfillmentType } from '@/lib/orders/fulfillment'
import { isFulfillmentType } from '@/lib/orders/fulfillment'

export interface ShippingAddress {
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state?: string
  pincode?: string
  country: string
}

export interface OrderItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

export interface Order {
  id: string
  userId: string | null
  isGuest?: boolean
  guestEmail?: string
  items: OrderItem[]
  shippingAddress: ShippingAddress
  paymentMethod: string
  fulfillmentType: FulfillmentType
  total: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
  estimatedDelivery?: string
  trackingNumber?: string
}

interface OrderStore {
  orders: Order[]
  loading: boolean
  initializeOrders: () => Promise<void>
  addOrder: (
    order: Omit<Order, 'id' | 'createdAt' | 'status' | 'trackingNumber' | 'estimatedDelivery' | 'userId' | 'isGuest' | 'guestEmail'> & {
      userId?: string | null
    },
    options?: {
      guest?: { email: string; phone?: string; name: string }
      /** Skip confirmation emails until payment completes (Paystack flow). */
      deferNotifications?: boolean
    }
  ) => Promise<string>
  getOrdersByUser: (userId: string) => Order[]
  getOrderById: (orderId: string) => Order | undefined
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<boolean>
  cancelOrder: (orderId: string, userId: string) => Promise<boolean>
}

export const useOrderStore = create<OrderStore>()((set, get) => ({
      orders: [],
      loading: false,
      
      initializeOrders: async () => {
        if (!isSupabaseConfigured()) {
          console.error('Supabase is not configured.')
          return
        }
        
        const { user, isAuthenticated, isAdmin } = useAuthStore.getState()
        
        if (!isAuthenticated || !user) {
          return
        }
        
        try {
          set({ loading: true })
          
          // Fetch orders from Supabase
          const ordersQuery = supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })

          const { data: ordersData, error: ordersError } = isAdmin
            ? await ordersQuery
            : await ordersQuery.eq('user_id', user.id)
          
          if (ordersError) {
            console.error('Error fetching orders:', ordersError)
            set({ loading: false })
            return
          }
          
          if (ordersData && ordersData.length > 0) {
            // Fetch order items for each order
            const orderIds = (ordersData || [])
              .filter((o: any) => o && o.id)
              .map((o: any) => o.id)
            const { data: itemsData, error: itemsError } = await supabase
              .from('order_items')
              .select(`
                *,
                products:product_id (
                  id,
                  name,
                  image
                )
              `)
              .in('order_id', orderIds)
            
            if (itemsError) {
              console.error('Error fetching order items:', itemsError)
            }
            
            // Convert to Order format
            const orders: Order[] = (ordersData || [])
              .filter((order: any) => order && order.id)
              .map((order: any) => {
                const orderItems = (itemsData || [])
                  .filter((item: any) => item && item.order_id === order.id)
                  .map((item: any) => ({
                    id: item.product_id || '',
                    name: item.products?.name || 'Product',
                    price: Number(item.price) || 0,
                    image: item.products?.image || '',
                    quantity: Number(item.quantity) || 1,
                  }))
                
                return {
                  id: order.id || '',
                  userId: order.user_id || '',
                  items: orderItems,
                  shippingAddress: order.shipping_address || {
                    fullName: '',
                    phone: '',
                    addressLine1: '',
                    city: '',
                    state: '',
                    country: 'Ghana',
                  },
                  paymentMethod: order.payment_method || 'cod',
                  fulfillmentType: isFulfillmentType(order.fulfillment_type)
                    ? order.fulfillment_type
                    : 'delivery',
                  total: Number(order.total) || 0,
                  status: order.status || 'pending',
                  createdAt: order.created_at || new Date().toISOString(),
                  trackingNumber: order.tracking_number || undefined,
                  estimatedDelivery: order.estimated_delivery || undefined,
                }
              })
            
            set({ orders, loading: false })
          } else {
            set({ loading: false })
          }
        } catch (error) {
          console.error('Error initializing orders:', error)
          set({ loading: false })
        }
      },
      
      addOrder: async (orderData, options) => {
        const { user, isAuthenticated } = useAuthStore.getState()
        const trackingNumber = generateTrackingNumber()
        const estimatedDelivery = calculateEstimatedDelivery(5)
        const isGuestCheckout = !!options?.guest
        
        if (!isSupabaseConfigured()) {
          console.error('Supabase is not configured.')
          return ''
        }
        
        if (!isGuestCheckout && (!isAuthenticated || !user)) {
          console.error('User must be authenticated or use guest checkout.')
          return ''
        }

        if (isGuestCheckout && !options?.guest?.email) {
          console.error('Guest email is required.')
          return ''
        }

        const guestToken = isGuestCheckout ? generateGuestAccessToken() : undefined
        
        const order: Order = {
          ...orderData,
          fulfillmentType: orderData.fulfillmentType ?? 'delivery',
          userId: isGuestCheckout ? null : user!.id,
          isGuest: isGuestCheckout,
          guestEmail: options?.guest?.email,
          id: `ORD-${Date.now()}`,
          status: 'pending',
          createdAt: new Date().toISOString(),
          estimatedDelivery,
          trackingNumber,
        }
        
        try {
            if (!order.items || order.items.length === 0) {
              console.error('Order must have at least one item')
              return ''
            }

            if (!order.shippingAddress || !order.shippingAddress.addressLine1) {
              console.error('Order must have a valid shipping address')
              return ''
            }

            const orderInsert: Record<string, unknown> = {
              id: order.id,
              user_id: isGuestCheckout ? null : user!.id,
              total: order.total,
              status: 'pending',
              shipping_address: order.shippingAddress,
              fulfillment_type: order.fulfillmentType ?? 'delivery',
              payment_method: order.paymentMethod || 'cod',
              tracking_number: trackingNumber,
              estimated_delivery: estimatedDelivery,
              is_guest: isGuestCheckout,
            }

            if (isGuestCheckout && options?.guest) {
              orderInsert.guest_email = options.guest.email.trim()
              orderInsert.guest_phone = options.guest.phone?.trim() ?? null
              orderInsert.guest_name = options.guest.name.trim()
              orderInsert.guest_access_token = guestToken
            }

            const { data: orderResult, error: orderError } = await supabase
              .from('orders')
              .insert(orderInsert as never)
              .select()
              .single()
            
            if (orderError) {
              console.error('Error creating order:', orderError)
              console.error('Order data:', {
                id: order.id,
                user_id: user?.id ?? 'guest',
                total: order.total,
                items_count: order.items?.length || 0,
              })
              throw orderError
            }
            
            if (!orderResult) {
              console.error('Order was not created - no data returned')
              return ''
            }
            
            // Validate products exist before creating order items
            const productIds = Array.from(new Set((order.items || []).map(item => item.id).filter(Boolean)))
            if (productIds.length > 0) {
              const { data: existingProducts, error: productsError } = await supabase
                .from('products')
                .select('id, name, stock')
                .in('id', productIds)
              
              if (productsError) {
                console.error('Error checking products:', productsError)
                await supabase.from('orders').delete().eq('id', order.id)
                throw new Error('Failed to validate products')
              }
              
              // Filter out items with products that don't exist
              const productMap = new Map(
                (existingProducts || []).map((p) => [
                  p.id,
                  { name: p.name as string, stock: Number(p.stock) || 0 },
                ])
              )
              const validItems = (order.items || []).filter((item) => productMap.has(item.id))
              
              if (validItems.length === 0) {
                await supabase.from('orders').delete().eq('id', order.id)
                throw new Error('No valid products found for order')
              }

              const needed = new Map<string, number>()
              for (const item of validItems) {
                needed.set(item.id, (needed.get(item.id) ?? 0) + item.quantity)
              }
              for (const [id, qty] of Array.from(needed.entries())) {
                const product = productMap.get(id)!
                if (product.stock < qty) {
                  await supabase.from('orders').delete().eq('id', order.id)
                  throw new Error(
                    `Not enough stock for ${product.name}. Available: ${product.stock}`
                  )
                }
              }
              
              // Insert order items only for valid products
              const orderItems = validItems
                .filter((item) => item && item.id && item.quantity > 0)
                .map((item) => ({
                  order_id: order.id,
                  product_id: item.id,
                  quantity: item.quantity || 1,
                  price: item.price || 0,
                }))
              
              const { data: itemsResult, error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems)
                .select()
              
              if (itemsError) {
                console.error('Error creating order items:', itemsError)
                // Rollback order creation if items fail
                await supabase
                  .from('orders')
                  .delete()
                  .eq('id', order.id)
                throw new Error('Failed to create order items')
              }
            } else {
              // Rollback order creation if no valid items
              await supabase
                .from('orders')
                .delete()
                .eq('id', order.id)
              console.error('Order must have at least one valid item')
              return ''
            }
          } catch (error) {
            console.error('Error adding order:', error)
            throw error
          }
        
        // Update local state
        const orders = get().orders || []
        set({ orders: [...orders, order] })
        
        if (isGuestCheckout && options?.guest && guestToken) {
          saveGuestOrderRef({
            orderId: order.id,
            accessToken: guestToken,
            email: options.guest.email,
          })
        }

        const customerName = isGuestCheckout
          ? options!.guest!.name
          : user!.name
        const customerEmail = isGuestCheckout
          ? options!.guest!.email
          : user!.email

        if (customerEmail && !options?.deferNotifications) {
          sendOrderNotification('customer', {
            orderId: order.id,
            customerName,
            customerEmail,
            customerPhone: order.shippingAddress.phone,
            orderTotal: order.total,
            orderItems: order.items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
            shippingAddress: order.shippingAddress,
            paymentMethod: order.paymentMethod,
            trackingNumber: trackingNumber,
            estimatedDelivery: estimatedDelivery,
          }).catch(err => console.error('Failed to send customer notification:', err))

          sendOrderNotification('admin', {
            orderId: order.id,
            customerName,
            customerEmail,
            customerPhone: order.shippingAddress.phone,
            orderTotal: order.total,
            orderItems: order.items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
            shippingAddress: order.shippingAddress,
            paymentMethod: order.paymentMethod,
            trackingNumber: trackingNumber,
            estimatedDelivery: estimatedDelivery,
          }).catch(err => console.error('Failed to send admin notification:', err))
        }
        
        return order.id
      },
      
      getOrdersByUser: (userId) => {
        const orders = get().orders || []
        return orders.filter((order) => order && order.userId === userId)
      },
      
      getOrderById: (orderId) => {
        const orders = get().orders || []
        return orders.find((order) => order && order.id === orderId)
      },
      
      updateOrderStatus: async (orderId, status) => {
        if (!isSupabaseConfigured()) {
          console.error('Supabase is not configured.')
          return false
        }

        const { isAdmin } = useAuthStore.getState()
        
        try {
          if (isAdmin) {
            const res = await fetch('/api/admin/orders/status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId, status }),
            })
            const data = (await res.json().catch(() => ({}))) as {
              error?: string
              sms?: Parameters<typeof toastStatusSmsResult>[0]
            }
            if (!res.ok) {
              console.error('Error updating order status:', data.error ?? res.statusText)
              alert(data.error ?? 'Failed to update order status')
              return false
            }
            toastStatusSmsResult(data.sms)
          } else {
            const { error } = await supabase
              .from('orders')
              .update({ status })
              .eq('id', orderId)
            
            if (error) {
              console.error('Error updating order status:', error)
              return false
            }
          }
          
          // Update local state
          const orders = get().orders || []
          set({
            orders: orders.map((order) =>
              order && order.id === orderId ? { ...order, status } : order
            ),
          })

          return true
        } catch (error) {
          console.error('Error updating order status:', error)
          return false
        }
      },
      
      cancelOrder: async (orderId, userId) => {
        if (!isSupabaseConfigured()) {
          console.error('Supabase is not configured.')
          return false
        }
        
        const orders = get().orders || []
        const order = orders.find((o) => o && o.id === orderId && o.userId === userId)
        if (!order) return false
        
        // Only allow cancellation if order is pending or confirmed
        if (order.status === 'pending' || order.status === 'confirmed') {
          return get().updateOrderStatus(orderId, 'cancelled')
        }
        return false
      },
    })
  )

// Initialize orders when user logs in
if (typeof window !== 'undefined') {
  useAuthStore.subscribe((state) => {
    if (state.isAuthenticated) {
      useOrderStore.getState().initializeOrders()
    }
  })
}
