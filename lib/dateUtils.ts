/**
 * Format date consistently for server and client to avoid hydration errors
 */
export function formatDate(date: Date | string | number): string {
  try {
    if (!date) {
      return 'N/A'
    }
    
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
    
    // Check if date is valid
    if (isNaN(d.getTime())) {
      return 'Invalid Date'
    }
    
    // Use a consistent format that works on both server and client
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    
    return `${day}/${month}/${year}`
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid Date'
  }
}

/**
 * Get current year - safe for SSR
 */
export function getCurrentYear(): number {
  // Use a static year to avoid hydration issues
  // In production, you might want to use a build-time constant
  return 2024
}

