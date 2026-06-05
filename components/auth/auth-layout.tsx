"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { siteConfig } from "@/config/site"

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="container-app py-10 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="font-display text-xl font-bold uppercase tracking-tight text-ink hover:text-pink-600"
          >
            {siteConfig.name}
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-pink-100 bg-white p-6 shadow-lg shadow-pink-100/40 sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="font-display text-2xl font-bold sm:text-3xl">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-sm text-neutral-600">{subtitle}</p>
            )}
          </div>
          {children}
        </div>

        <p className="mt-6 text-center text-xs text-neutral-500">
          Secure checkout · Encrypted sessions · Trusted by beauty lovers
        </p>
      </motion.div>
    </div>
  )
}
