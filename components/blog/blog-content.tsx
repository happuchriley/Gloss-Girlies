import { parseBlogContent } from "@/lib/blog/content"
import { isVideoMediaUrl } from "@/hooks/use-media-upload"

interface BlogContentProps {
  content: string
  className?: string
}

export function BlogContent({ content, className }: BlogContentProps) {
  const parts = parseBlogContent(content)

  return (
    <div className={className}>
      {parts.map((part, index) => {
        if (part.type === "image") {
          return (
            <figure key={`${part.url}-${index}`} className="my-6 overflow-hidden rounded-2xl border border-pink-100">
              <img src={part.url} alt="" className="w-full object-cover" />
            </figure>
          )
        }

        if (part.type === "video") return null

        return (
          <div
            key={`text-${index}`}
            className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-700 md:text-base"
          >
            {part.value}
          </div>
        )
      })}
    </div>
  )
}

export function BlogCoverMedia({ src, alt = "" }: { src: string; alt?: string }) {
  if (!src) return null

  if (isVideoMediaUrl(src)) return null

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-pink-100">
      <img src={src} alt={alt} className="aspect-[16/9] w-full object-cover" />
    </div>
  )
}
