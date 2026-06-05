"use client"

import Link from "next/link"

import { BrandLogo } from "@/components/brand/brand-logo"
import { developerCredit, footerNav, siteConfig } from "@/config/site"
import { getCurrentYear } from "@/lib/dateUtils"

const FOOTER_SECTIONS = [
  { key: "shop", label: "Shop", links: footerNav.shop },
  { key: "explore", label: "Explore", links: footerNav.explore },
  { key: "legal", label: "Legal", links: footerNav.legal },
] as const

export function SiteFooter() {
  const year = getCurrentYear()

  return (
    <footer className="mt-auto bg-ink text-white">
      <div className="container-app pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] pt-14 md:pb-10">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <div className="max-w-xs lg:max-w-sm">
            <BrandLogo dark />
            <p className="mt-4 text-sm leading-relaxed text-white/40">
              Beauty, distilled.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8 sm:gap-12 lg:gap-16">
            {FOOTER_SECTIONS.map(({ key, label, links }) => (
              <div key={key}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-pink-500">
                  {label}
                </p>
                <nav className="mt-4 flex flex-col gap-3">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-sm text-white/50 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-row items-center justify-between gap-4 border-t border-white/10 pt-6">
          <p className="shrink-0 text-[11px] uppercase tracking-[0.2em] text-white/25">
            © {year} {siteConfig.name}
          </p>
          <p className="shrink-0 text-sm text-white/40">
            Developed by{" "}
            <a
              href={developerCredit.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-pink-400 transition-colors hover:text-pink-300"
            >
              {developerCredit.label}
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
