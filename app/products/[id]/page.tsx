'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useProductStore } from '@/store/productStore'
import { useCartStore } from '@/store/cartStore'
import { useReviewStore } from '@/store/reviewStore'
import { useAuthStore } from '@/store/authStore'
import { FiShoppingCart, FiPlus, FiMinus, FiStar } from 'react-icons/fi'
import { useState } from 'react'
import Link from 'next/link'
import { formatDate } from '@/lib/dateUtils'
import BackButton from '@/components/BackButton'

export default function ProductDetail() {
  const params = useParams()
  const { products, getProductById, initializeProducts } = useProductStore()
  const addItem = useCartStore((state) => state.addItem)
  const { getReviewsByProduct, getAverageRating } = useReviewStore()
  const { isAdmin } = useAuthStore()
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    initializeProducts()
  }, [initializeProducts])

  const product = getProductById(params.id as string)

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Link href="/" className="text-pink-600 hover:underline">
          Go back to home
        </Link>
      </div>
    )
  }

  const handleAddToCart = () => {
    if (isAdmin) {
      alert('Admin accounts cannot make purchases. Please use a regular customer account.')
      return
    }

    if (product.stock < quantity) {
      alert(`Only ${product.stock} item(s) available in stock.`)
      setQuantity(product.stock)
      return
    }
    
    if (product.stock === 0) {
      alert('This product is currently out of stock.')
      return
    }

    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      })
    }
    alert(`${quantity} item(s) added to cart!`)
  }

  // Get related products (same category, different product)
  const relatedProducts = (products || [])
    .filter((p) => p && p.category === product.category && p.id !== product.id && p.stock > 0)
    .slice(0, 4)

  // Get reviews for this product
  const productReviews = getReviewsByProduct(product.id) || []
  const averageRating = getAverageRating(product.id) || 0
  const reviewCount = productReviews.length

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
      <div className="mb-4 sm:mb-6">
        <BackButton />
      </div>
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-10 md:mb-12">
        <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">{product.brand}</p>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
          
          {/* Rating Display */}
          {reviewCount > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar
                    key={star}
                    className={`${
                      star <= Math.round(averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs sm:text-sm text-gray-600">
                {averageRating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
          
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">₵{product.price}</p>
          <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">{product.description}</p>
          
          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                aria-label="Decrease quantity"
              >
                <FiMinus className="text-sm sm:text-base" />
              </button>
              <span className="text-base sm:text-lg font-medium w-10 sm:w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Increase quantity"
              >
                <FiPlus className="text-sm sm:text-base" />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">
              {product.stock > 0 ? (
                <span className={product.stock < 10 ? 'text-yellow-600 font-medium' : 'text-green-600'}>
                  {product.stock} in stock
                </span>
              ) : (
                <span className="text-red-600 font-medium">Out of stock</span>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isAdmin}
            className={`w-full py-2.5 sm:py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base ${
              isAdmin
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : product.stock === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-pink-600 text-white hover:bg-pink-700'
            }`}
            title={isAdmin ? 'Admin accounts cannot make purchases' : product.stock === 0 ? 'Out of stock' : 'Add to cart'}
          >
            <FiShoppingCart className="text-base sm:text-lg" />
            {isAdmin ? 'Admin Cannot Purchase' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-8 sm:mt-10 md:mt-12">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {(relatedProducts || []).map((relatedProduct) => (
              <Link
                key={relatedProduct.id}
                href={`/products/${relatedProduct.id}`}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-square relative">
                  <img
                    src={relatedProduct.image}
                    alt={relatedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-1">{relatedProduct.brand}</p>
                  <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">
                    {relatedProduct.name}
                  </h3>
                  <p className="text-lg font-bold text-gray-900">₵{relatedProduct.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Product Reviews */}
      <div className="mt-8 sm:mt-10 md:mt-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Customer Reviews</h2>
          <Link
            href={`/reviews?product=${product.id}`}
            className="text-sm sm:text-base text-pink-600 hover:underline"
          >
            Write a Review
          </Link>
        </div>

        {productReviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500 mb-4">No reviews yet. Be the first to review this product!</p>
            <Link
              href={`/reviews?product=${product.id}`}
              className="inline-block bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors"
            >
              Write First Review
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {productReviews.slice(0, 5).map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold">{review.userName}</h3>
                    <p className="text-sm text-gray-500">{formatDate(review.date)}</p>
                  </div>
                  <div className="flex items-center gap-1">
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
                        alt={`Review ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
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
                        className="w-full h-24 object-cover rounded-lg"
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
            ))}
            {productReviews.length > 5 && (
              <Link
                href={`/reviews?product=${product.id}`}
                className="block text-center text-pink-600 hover:underline font-medium"
              >
                View All {productReviews.length} Reviews →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

