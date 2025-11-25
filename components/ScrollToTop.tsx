'use client'

import { useState, useEffect } from 'react'
import { FiArrowUp } from 'react-icons/fi'

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Only run on client side to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
    
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    // Set initial visibility
    toggleVisibility()

    window.addEventListener('scroll', toggleVisibility)

    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 sm:bottom-24 lg:bottom-8 right-4 sm:right-6 lg:right-8 z-50 bg-pink-600 text-white p-3 sm:p-3.5 rounded-full shadow-lg hover:bg-pink-700 transition-all duration-300 ease-in-out hover:scale-110 active:scale-95"
          aria-label="Scroll to top"
        >
          <FiArrowUp className="text-lg sm:text-xl" />
        </button>
      )}
    </>
  )
}

