'use client'

import Link from 'next/link'
import Image from 'next/image'
import { categories } from '@/data/products'

export default function CategorySection() {
  return (
    <div className="bg-gray-50 py-4 sm:py-6 md:py-8">
      <div className="container mx-auto px-2 sm:px-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 px-2 sm:px-0">Shop Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.id}`}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-square relative">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 text-center">
                <p className="text-sm font-medium text-gray-800">{category.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

