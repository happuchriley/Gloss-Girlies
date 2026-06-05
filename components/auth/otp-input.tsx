"use client"

import { useRef } from "react"

import { cn } from "@/lib/utils"

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: boolean
}

const OTP_LENGTH = 6

export function OtpInput({ value, onChange, disabled, error }: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  const digits = value.padEnd(OTP_LENGTH, " ").split("").slice(0, OTP_LENGTH)

  const updateAt = (index: number, char: string) => {
    const next = value.split("")
    next[index] = char
    onChange(next.join("").replace(/\s/g, "").slice(0, OTP_LENGTH))
  }

  const handleChange = (index: number, raw: string) => {
    const char = raw.replace(/\D/g, "").slice(-1)
    if (!char) {
      updateAt(index, "")
      return
    }
    updateAt(index, char)
    if (index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !digits[index]?.trim() && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH)
    if (!pasted) return
    onChange(pasted)
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1)
    inputsRef.current[focusIndex]?.focus()
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit.trim()}
          disabled={disabled}
          aria-label={`Digit ${index + 1}`}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={cn(
            "h-12 w-10 rounded-xl border bg-white text-center text-lg font-semibold text-ink shadow-sm transition-colors sm:h-14 sm:w-12 sm:text-xl",
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-200"
              : "border-pink-200 focus:border-pink-400 focus:ring-pink-200",
            "focus:outline-none focus:ring-2",
            disabled && "cursor-not-allowed opacity-60"
          )}
        />
      ))}
    </div>
  )
}
