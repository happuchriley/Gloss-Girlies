/** Maps Supabase Auth errors to safe, user-facing messages. */
export function mapAuthError(message: string): string {
  const lower = message.toLowerCase()

  if (lower.includes("invalid login credentials")) {
    return "Invalid email or password. Please try again."
  }
  if (lower.includes("email not confirmed")) {
    return "Please verify your email before signing in. Check your inbox for the confirmation link."
  }
  if (lower.includes("user already registered")) {
    return "An account with this email already exists. Try signing in instead."
  }
  if (lower.includes("password should be at least")) {
    return "Password must be at least 6 characters."
  }
  if (lower.includes("unable to validate email")) {
    return "Please enter a valid email address."
  }
  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Too many attempts. Please wait a moment and try again."
  }
  if (lower.includes("session")) {
    return "Your session has expired. Please sign in again."
  }

  return "Something went wrong. Please try again."
}
