import Link from "next/link"

import { siteConfig } from "@/config/site"

import { cn } from "@/lib/utils"



interface BrandLogoProps {

  className?: string

  wordmarkClassName?: string

  showWordmark?: boolean

  dark?: boolean

  asLink?: boolean

}



export function BrandLogo({

  className,

  wordmarkClassName = "text-sm sm:text-base md:text-lg",

  showWordmark = true,

  dark = false,

  asLink = true,

}: BrandLogoProps) {

  const textClass = dark ? "text-white group-hover:text-pink-300" : "text-ink group-hover:text-pink-600"



  const lockup = (

    <span

      className={cn(

        "font-display whitespace-nowrap font-semibold uppercase leading-none tracking-[0.14em]",

        wordmarkClassName,

        textClass

      )}

    >

      {showWordmark ? siteConfig.name : "GG"}

    </span>

  )



  const rootClass = cn("inline-flex min-w-0 shrink-0 items-center", className)



  if (!asLink) {

    return (

      <div className={rootClass} aria-label={siteConfig.name}>

        {lockup}

      </div>

    )

  }



  return (

    <Link href="/" className={cn(rootClass, "group")} aria-label={`${siteConfig.name} — Home`}>

      {lockup}

    </Link>

  )

}

