"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

export function Toaster({ ...props }: ToasterProps) {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-2xl group-[.toaster]:border group-[.toaster]:border-pink-100 group-[.toaster]:bg-white group-[.toaster]:text-ink group-[.toaster]:shadow-elevated group-[.toaster]:shadow-pink-100/30",
          title: "group-[.toast]:font-medium group-[.toast]:text-ink",
          description: "group-[.toast]:text-neutral-600",
          actionButton:
            "group-[.toast]:rounded-md group-[.toast]:bg-brand group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:rounded-md group-[.toast]:border group-[.toast]:border-pink-200 group-[.toast]:bg-brand-light group-[.toast]:text-ink",
          closeButton:
            "group-[.toast]:border-pink-100 group-[.toast]:bg-white group-[.toast]:text-neutral-500 group-[.toast]:hover:bg-brand-light group-[.toast]:hover:text-ink",
          success:
            "group-[.toaster]:border-pink-200 group-[.toaster]:bg-brand-light",
          error:
            "group-[.toaster]:border-destructive/25 group-[.toaster]:bg-destructive/5",
          info: "group-[.toaster]:border-pink-100 group-[.toaster]:bg-surface",
          warning:
            "group-[.toaster]:border-pink-300 group-[.toaster]:bg-pink-50",
        },
      }}
      {...props}
    />
  )
}
