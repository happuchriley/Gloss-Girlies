/**
 * Safe storage for Zustand persist middleware
 * Prevents hydration errors by only accessing localStorage on the client
 */

export const safeStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') {
      return null
    }
    try {
      return localStorage.getItem(name)
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return null
    }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      localStorage.setItem(name, value)
    } catch (error) {
      console.error('Error writing to localStorage:', error)
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      localStorage.removeItem(name)
    } catch (error) {
      console.error('Error removing from localStorage:', error)
    }
  },
}

