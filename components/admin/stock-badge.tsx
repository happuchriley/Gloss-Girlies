import { Badge } from "@/components/ui/badge"

export function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <Badge variant="destructive">Out of stock</Badge>
  if (stock < 20) return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Low stock</Badge>
  return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">In stock</Badge>
}
