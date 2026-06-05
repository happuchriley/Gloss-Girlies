const MEDIA_BLOCK_RE = /\[(IMAGE|VIDEO)\]([\s\S]*?)\[\/\1\]/g

export function insertMediaIntoContent(
  content: string,
  url: string,
  type: "image" | "video"
): string {
  const tag = type === "image" ? "IMAGE" : "VIDEO"
  const block = `[${tag}]${url}[/${tag}]`
  if (!content.trim()) return `${block}\n\n`
  return `${content.trimEnd()}\n\n${block}\n\n`
}

export type BlogContentPart =
  | { type: "text"; value: string }
  | { type: "image"; url: string }
  | { type: "video"; url: string }

export function parseBlogContent(content: string): BlogContentPart[] {
  const parts: BlogContentPart[] = []
  let lastIndex = 0
  const pattern = new RegExp(MEDIA_BLOCK_RE.source, MEDIA_BLOCK_RE.flags)

  let match = pattern.exec(content)
  while (match) {
    const index = match.index ?? 0
    const before = content.slice(lastIndex, index)
    if (before.trim()) {
      parts.push({ type: "text", value: before.trimEnd() })
    }

    const mediaType = match[1] === "VIDEO" ? "video" : "image"
    parts.push({ type: mediaType, url: match[2].trim() })
    lastIndex = index + match[0].length
    match = pattern.exec(content)
  }

  const remaining = content.slice(lastIndex)
  if (remaining.trim()) {
    parts.push({ type: "text", value: remaining.trimStart() })
  }

  if (parts.length === 0 && content.trim()) {
    parts.push({ type: "text", value: content })
  }

  return parts
}
