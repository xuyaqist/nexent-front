import { Fragment } from "react"

interface CitationOptions {
  /** valid citation ids that can be referenced inline as [n] */
  validIds?: Set<number>
  /** called when a citation badge is clicked */
  onCitationClick?: (id: number) => void
}

/** Renders **bold**, `code`, and [n] citation markers inside a line of text. */
function renderInline(text: string, citations?: CitationOptions) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[\d+\])/g)
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
    // citation marker like [1]
    const cite = p.match(/^\[(\d+)\]$/)
    if (cite) {
      const id = Number(cite[1])
      if (!citations?.validIds || citations.validIds.has(id)) {
        return (
          <button
            key={i}
            type="button"
            onClick={() => citations?.onCitationClick?.(id)}
            className="mx-0.5 inline-flex h-4 min-w-4 translate-y-[-1px] items-center justify-center rounded-[4px] bg-primary/10 px-1 align-middle text-[10px] font-semibold leading-none text-primary transition-colors hover:bg-primary/20"
            aria-label={`查看来源 ${id}`}
          >
            {id}
          </button>
        )
      }
    }
    return <Fragment key={i}>{p}</Fragment>
  })
}

/**
 * Minimal markdown renderer good enough for the demo: paragraphs, bold,
 * inline code, fenced code blocks, "- " bullet lists, and [n] citations.
 */
export function Markdown({ text, citations }: { text: string; citations?: CitationOptions }) {
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
                  <li key={i}>{renderInline(li, citations)}</li>
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
            if (line.trim()) elements.push(<p key={`p-${bi}-${li}`}>{renderInline(line, citations)}</p>)
          }
        })
        flushList(`ul-${bi}-end`)
        return <Fragment key={bi}>{elements}</Fragment>
      })}
    </div>
  )
}
