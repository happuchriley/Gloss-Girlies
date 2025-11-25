'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { FiStar, FiImage, FiVideo, FiSend } from 'react-icons/fi'
import { useProductStore } from '@/store/productStore'
import { useReviewStore } from '@/store/reviewStore'
import { useAuthStore } from '@/store/authStore'
import { formatDate } from '@/lib/dateUtils'

function ReviewsContent() {
  const searchParams = useSearchParams()
  const { products, initializeProducts } = useProductStore()
  const { reviews, addReview, getReviewsByProduct } = useReviewStore()
  const { user } = useAuthStore()
  const [selectedProduct, setSelectedProduct] = useState(searchParams.get('product') || '')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [videos, setVideos] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [videoPreviews, setVideoPreviews] = useState<string[]>([])

  useEffect(() => {
    initializeProducts()
  }, [initializeProducts])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages([...images, ...files])
    
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews([...imagePreviews, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setVideos([...videos, ...files])
    
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setVideoPreviews([...videoPreviews, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct || rating === 0 || !comment.trim()) {
      alert('Please fill in all required fields')
      return
    }

    if (!user) {
      alert('Please login to submit a review')
      return
    }

    const success = await addReview({
      productId: selectedProduct,
      userId: user.id,
      rating,
      comment,
      images: imagePreviews,
      videos: videoPreviews,
    })

    if (success) {
      setSelectedProduct('')
      setRating(0)
      setComment('')
      setImages([])
      setVideos([])
      setImagePreviews([])
      setVideoPreviews([])
      alert('Review submitted successfully!')
    } else {
      alert('Failed to submit review. You may have already reviewed this product.')
    }
  }

  const removeImage = (index: number) => {
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
    setImages(images.filter((_, i) => i !== index))
  }

  const removeVideo = (index: number) => {
    setVideoPreviews(videoPreviews.filter((_, i) => i !== index))
    setVideos(videos.filter((_, i) => i !== index))
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8">Product Reviews</h1>

      {/* Review Form */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="text-xl font-bold mb-4">Write a Review</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Product
            </label>
            <select
              id="reviewProduct"
              name="reviewProduct"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            >
              <option value="">Choose a product...</option>
              {(products || []).map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`${
                    star <= rating
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  } hover:text-yellow-400 transition-colors`}
                  aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                >
                  <FiStar className="text-2xl fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review
            </label>
            <textarea
              id="reviewComment"
              name="reviewComment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Share your experience with this product..."
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images
              </label>
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-pink-500 transition-colors">
                <div className="text-center">
                  <FiImage className="text-2xl text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload images</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        aria-label="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Videos
              </label>
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-pink-500 transition-colors">
                <div className="text-center">
                  <FiVideo className="text-2xl text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload videos</p>
                </div>
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </label>
              {videoPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {(videoPreviews || []).map((preview, index) => (
                    <div key={index} className="relative">
                      <video
                        src={preview}
                        className="w-full h-24 object-cover rounded-lg"
                        controls
                        preload="metadata"
                        playsInline
                        disablePictureInPicture
                        controlsList="nodownload"
                      />
                      <button
                        type="button"
                        onClick={() => removeVideo(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        aria-label="Remove video"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-pink-600 text-white py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
          >
            <FiSend />
            Submit Review
          </button>
        </form>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-4">
          {selectedProduct ? `Reviews for ${(products || []).find(p => p && p.id === selectedProduct)?.name || 'Product'}` : 'All Reviews'}
        </h2>
        {selectedProduct ? (
          getReviewsByProduct(selectedProduct).length === 0 ? (
            <p className="text-center text-gray-500 py-16">No reviews for this product yet.</p>
          ) : (
            (getReviewsByProduct(selectedProduct) || []).map((review) => {
              const product = (products || []).find((p) => p && p.id === review.productId)
              return (
                <div key={review.id} className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{product?.name || 'Product'}</h3>
                      <p className="text-sm text-gray-500">{review.userName} • {formatDate(review.date)}</p>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                          key={star}
                          className={`${
                            star <= review.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{review.comment}</p>
                  
                  {review.images && review.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {(review.images || []).map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt={`Review image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}

                  {review.videos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {review.videos.map((vid, index) => (
                        <video
                          key={index}
                          src={vid}
                          className="w-full h-32 object-cover rounded-lg"
                          controls
                          preload="metadata"
                          playsInline
                          disablePictureInPicture
                          controlsList="nodownload"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )
        ) : reviews.length === 0 ? (
          <p className="text-center text-gray-500 py-16">No reviews yet. Be the first to review!</p>
        ) : (
          (reviews || []).map((review) => {
            const product = products.find((p) => p.id === review.productId)
            return (
              <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{product?.name || 'Product'}</h3>
                    <p className="text-sm text-gray-500">{review.userName} • {review.date}</p>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar
                        key={star}
                        className={`${
                          star <= review.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{review.comment}</p>
                
                {review.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {review.images.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`Review image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}

                {review.videos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {review.videos.map((vid, index) => (
                      <video
                        key={index}
                        src={vid}
                        className="w-full h-32 object-cover rounded-lg"
                        controls
                        preload="metadata"
                        playsInline
                        disablePictureInPicture
                        controlsList="nodownload"
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default function ReviewsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8">Product Reviews</h1>
        <div className="text-center py-16">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    }>
      <ReviewsContent />
    </Suspense>
  )
}

