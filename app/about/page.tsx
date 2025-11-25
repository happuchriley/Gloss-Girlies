export default function AboutPage() {
  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8">About Gloss Girlies</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
          <section>
            <h2 className="text-xl font-bold mb-4">Our Story</h2>
            <p className="text-gray-700">
              Gloss Girlies was founded with a mission to make beauty accessible to everyone. We believe that everyone deserves to feel confident and beautiful, and we're here to help you discover the perfect products for your unique style.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-700">
              To provide high-quality beauty and cosmetic products at affordable prices, while ensuring excellent customer service and a seamless shopping experience.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">What We Offer</h2>
            <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
              <li>Wide range of authentic beauty products</li>
              <li>Competitive prices and regular offers</li>
              <li>Fast and reliable shipping</li>
              <li>Easy returns and exchanges</li>
              <li>Expert customer support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Contact Us</h2>
            <p className="text-gray-700">
              Have questions or feedback? We'd love to hear from you! Reach us at support@glossgirlies.com or call 1800-123-4567.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

