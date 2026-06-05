"use client"

import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { useState } from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  className?: string
  placeholder?: string
}

export function SearchBar({
  className,
  placeholder = "Search beauty, skincare, makeup…",
}: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("relative w-full", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-full border-pink-200 bg-pink-50/50 pl-10 pr-4 focus-visible:border-pink-400 focus-visible:bg-white focus-visible:ring-pink-500"
        aria-label="Search products"
      />
    </form>
  )
}
