/** PostgREST / Supabase errors sometimes log as `{}` — read known fields explicitly. */
export function formatSupabaseError(error: unknown): string {
  if (error == null) return "Unknown error"
  if (typeof error === "string") return error
  if (typeof error !== "object") return String(error)

  const e = error as {
    message?: string
    code?: string
    details?: string
    hint?: string
  }

  return (
    e.message ||
    e.details ||
    e.hint ||
    e.code ||
    JSON.stringify(error)
  )
}

/** Table or view not in DB / schema cache (migration not applied). */
export function isMissingRelationError(error: unknown, relation?: string): boolean {
  const text = formatSupabaseError(error).toLowerCase()
  const missing =
    text.includes("does not exist") ||
    text.includes("schema cache") ||
    text.includes("pgrst205") ||
    text.includes("42p01")

  if (!relation) return missing
  return missing && text.includes(relation.toLowerCase())
}
