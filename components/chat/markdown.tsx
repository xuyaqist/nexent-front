import { Fragment } from "react"

/** Renders **bold** inside a line of plain text. */
function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {p.slice(2, -2)}
        </strong>
      )
    }
    if (p.startsWith("`") && p.endsWith("`")) {
      return (
        <code key={i} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">
          {p.slice(1, -1)}
        </code>
      )
    }
    return <Fragment key={i}>{p}</Fragment>
  })
}

/**
 * Minimal markdown renderer good enough for the demo: paragraphs, bold,
 * inline code, fenced code blocks and "- " bullet lists.
 */
export function Markdown({ text }: { text: string }) {
  const blocks = text.split(/```/)
  return (
    <div className="space-y-3 text-sm leading-relaxed text-foreground">
      {blocks.map((block, bi) => {
        // odd indexes are fenced code blocks
        if (bi % 2 === 1) {
          const firstNewline = block.indexOf("\n")
          const code = firstNewline >= 0 ? block.slice(firstNewline + 1) : block
          return (
            <pre
              key={bi}
              className="overflow-x-auto rounded-lg border border-border bg-muted/60 p-3 font-mono text-xs leading-relaxed"
            >
              <code>{code.replace(/\n$/, "")}</code>
            </pre>
          )
        }
        const lines = block.split("\n").filter((l, idx, arr) => !(l === "" && (idx === 0 || idx === arr.length - 1)))
        const elements: React.ReactNode[] = []
        let list: string[] = []
        const flushList = (key: string) => {
          if (list.length) {
            elements.push(
              <ul key={key} className="list-disc space-y-1 pl-5">
                {list.map((li, i) => (
                  <li key={i}>{renderInline(li)}</li>
                ))}
              </ul>,
            )
            list = []
          }
        }
        lines.forEach((line, li) => {
          const bullet = line.match(/^\s*[-•]\s+(.*)$/)
          if (bullet) {
            list.push(bullet[1])
          } else {
            flushList(`ul-${bi}-${li}`)
            if (line.trim()) elements.push(<p key={`p-${bi}-${li}`}>{renderInline(line)}</p>)
          }
        })
        flushList(`ul-${bi}-end`)
        return <Fragment key={bi}>{elements}</Fragment>
      })}
    </div>
  )
}
