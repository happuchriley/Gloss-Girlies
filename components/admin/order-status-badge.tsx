import { Badge } from "@/components/ui/badge"

export function OrderStatusBadge({ status }: { status: string }) {
  if (status === "delivered")
    return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Delivered</Badge>
  if (status === "shipped")
    return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Shipped</Badge>
  if (status === "confirmed")
    return <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-100">Confirmed</Badge>
  if (status === "cancelled") return <Badge variant="destructive">Cancelled</Badge>
  return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>
}
