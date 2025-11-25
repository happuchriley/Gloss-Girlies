import CategorySection from '@/components/CategorySection'

export default function CategoriesPage() {
  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8">All Categories</h1>
      <CategorySection />
    </div>
  )
}

