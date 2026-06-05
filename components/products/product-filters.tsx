"use client"

import { SlidersHorizontal } from "lucide-react"

import type { SortOption } from "@/lib/products/types"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProductFiltersBarProps {
  sort: SortOption
  onSortChange: (sort: SortOption) => void
  brand?: string
  brands: string[]
  onBrandChange: (brand: string) => void
  minPrice?: string
  maxPrice?: string
  onMinPriceChange: (v: string) => void
  onMaxPriceChange: (v: string) => void
  onClear: () => void
  className?: string
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name A–Z" },
]

export function ProductFiltersBar({
  sort,
  onSortChange,
  brand,
  brands,
  onBrandChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  onClear,
  className,
}: ProductFiltersBarProps) {
  return (
    <div
      className={cn(
        "space-y-4 rounded-2xl border border-pink-100 bg-white p-4 shadow-sm lg:sticky lg:top-24 lg:self-start",
        className
      )}
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </div>

      <div className="space-y-2">
        <Label htmlFor="sort">Sort by</Label>
        <select
          id="sort"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {brands.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="brand">Brand</Label>
          <select
            id="brand"
            value={brand ?? ""}
            onChange={(e) => onBrandChange(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label htmlFor="minPrice">Min ₵</Label>
          <Input
            id="minPrice"
            type="number"
            min={0}
            value={minPrice ?? ""}
            onChange={(e) => onMinPriceChange(e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxPrice">Max ₵</Label>
          <Input
            id="maxPrice"
            type="number"
            min={0}
            value={maxPrice ?? ""}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            placeholder="Any"
          />
        </div>
      </div>

      <Button type="button" variant="outline" className="w-full" onClick={onClear}>
        Clear filters
      </Button>
    </div>
  )
}
