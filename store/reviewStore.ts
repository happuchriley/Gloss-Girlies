import { create } from 'zustand'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useAuthStore } from './authStore'

export interface ProductReview {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  comment: string
  images: string[]
  videos: string[]
  date: string
  helpful?: number
}

interface ReviewStore {
  reviews: ProductReview[]
  loading: boolean
  initializeReviews: () => Promise<void>
  addReview: (review: Omit<ProductReview, 'id' | 'date' | 'helpful' | 'userName'>) => Promise<boolean>
  getReviewsByProduct: (productId: string) => ProductReview[]
  getAverageRating: (productId: string) => number
  markHelpful: (reviewId: string) => void
}

export const useReviewStore = create<ReviewStore>()((set, get) => ({
      reviews: [],
      loading: false,
      
      initializeReviews: async () => {
        if (!isSupabaseConfigured()) {
          console.error('Supabase is not configured.')
          return
        }
        
        try {
          set({ loading: true })
          
          // Fetch all reviews from Supabase
          // Note: PostgREST doesn't support the users:user_id syntax
          // We'll fetch reviews and user names separately or use a different approach
          const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false })
          
          if (error) {
            console.error('Error fetching reviews:', error)
            set({ loading: false })
            return
          }
          
          if (data) {
            // Fetch user names separately since PostgREST doesn't support nested queries easily
            const userIds = Array.from(new Set((data || []).map((r: any) => r.user_id).filter(Boolean)))
            const userNamesMap: Record<string, string> = {}
            
            if (userIds.length > 0) {
              const { data: usersData } = await supabase
                .from('users')
                .select('id, name')
                .in('id', userIds)
              
              if (usersData) {
                usersData.forEach((u: any) => {
                  if (u && u.id) {
                    userNamesMap[u.id] = u.name || 'Anonymous'
                  }
                })
              }
            }
            
            // Convert to ProductReview format
            const reviews: ProductReview[] = (data || [])
              .filter((review: any) => review && review.id)
              .map((review: any) => ({
                id: review.id || '',
                productId: review.product_id || '',
                userId: review.user_id || '',
                userName: userNamesMap[review.user_id] || 'Anonymous',
                rating: Number(review.rating) || 0,
                comment: review.comment || '',
                images: Array.isArray(review.images) ? review.images : [],
                videos: Array.isArray(review.videos) ? review.videos : [],
                date: review.created_at || new Date().toISOString(),
                helpful: 0,
              }))
            
            set({ reviews, loading: false })
          } else {
            set({ loading: false })
          }
        } catch (error) {
          console.error('Error initializing reviews:', error)
          set({ loading: false })
        }
      },
      
      addReview: async (reviewData) => {
        if (!isSupabaseConfigured()) {
          console.error('Supabase is not configured.')
          return false
        }
        
        const { user, isAuthenticated } = useAuthStore.getState()
        
        if (!isAuthenticated || !user) {
          console.warn('User must be authenticated to add a review')
          return false
        }
        
        const review: ProductReview = {
          ...reviewData,
          id: Date.now().toString(),
          date: new Date().toISOString(),
          helpful: 0,
          userName: user.name,
        }
        
        try {
          const { error } = await supabase
            .from('reviews')
            .insert({
              id: review.id,
              user_id: user.id,
              product_id: review.productId,
              rating: review.rating,
              comment: review.comment,
              images: review.images && review.images.length > 0 ? review.images : null,
              videos: review.videos && review.videos.length > 0 ? review.videos : null,
            })
          
          if (error) {
            console.error('Error adding review:', error)
            // Check if it's a duplicate review error
            if (error.code === '23505') { // Unique constraint violation
              console.warn('User has already reviewed this product')
              return false
            }
            return false
          }
          
          // Update local state only if database insert succeeded
          set({ reviews: [...get().reviews, review] })
          return true
        } catch (error) {
          console.error('Error adding review:', error)
          return false
        }
      },
      
      getReviewsByProduct: (productId) => {
        const reviews = get().reviews || []
        return reviews.filter((r) => r && r.productId === productId)
      },
      
      getAverageRating: (productId) => {
        const reviews = get().reviews || []
        const productReviews = reviews.filter((r) => r && r.productId === productId)
        if (productReviews.length === 0) return 0
        const sum = productReviews.reduce((acc, r) => {
          const rating = Number(r.rating) || 0
          return acc + rating
        }, 0)
        return sum / productReviews.length
      },
      
      markHelpful: (reviewId) => {
        // This is a simple local state update
        // In a full implementation, you'd want to track this per user in the database
        set({
          reviews: get().reviews.map((r) =>
            r.id === reviewId ? { ...r, helpful: (r.helpful || 0) + 1 } : r
          ),
        })
      },
    })
  )

// Initialize reviews on mount
if (typeof window !== 'undefined' && isSupabaseConfigured()) {
  useReviewStore.getState().initializeReviews()
}
