'use client'

import { useRouter } from 'next/navigation'
import { FiArrowLeft } from 'react-icons/fi'

interface BackButtonProps {
  className?: string
  label?: string
}

export default function BackButton({ className = '', label = 'Back' }: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return (
    <button
      onClick={handleBack}
      className={`flex items-center gap-2 text-gray-700 hover:text-pink-600 transition-colors ${className}`}
      aria-label="Go back"
    >
      <FiArrowLeft className="text-lg" />
      <span className="text-sm sm:text-base font-medium">{label}</span>
    </button>
  )
}

