import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY

  if (!url || !key) {
    return supabaseResponse
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  const isAdminRoute = pathname.startsWith("/admin")
  const isProtectedAccountRoute =
    pathname.startsWith("/account/settings") ||
    pathname.startsWith("/orders")

  if (!user && (isAdminRoute || isProtectedAccountRoute)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/account"
    redirectUrl.searchParams.set("tab", "login")
    redirectUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (user && isAdminRoute) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    const role = (profile as { role?: string } | null)?.role

    if (role !== "admin") {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = "/"
      redirectUrl.searchParams.set("error", "unauthorized")
      return NextResponse.redirect(redirectUrl)
    }
  }

  return supabaseResponse
}
