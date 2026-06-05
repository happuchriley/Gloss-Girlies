import { redirect } from "next/navigation"

import { getServerSession } from "@/lib/auth/session"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = await getServerSession()

  if (!user) {
    redirect("/account?tab=login&redirect=/admin")
  }

  if (user.role !== "admin") {
    redirect("/?error=unauthorized")
  }

  return <div className="admin-page">{children}</div>
}
