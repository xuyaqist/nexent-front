"use client"

import { useEffect, useRef, useState } from "react"
import { Sparkles, ArrowUpRight, BookOpen, ChevronDown, ExternalLink, Globe, Library } from "lucide-react"
import { cn } from "@/lib/utils"
import { Markdown } from "./markdown"
import {
  ReasoningBlock,
  ToolBlock,
  HitlBlock,
  TokenUsageBadge,
} from "./message-parts"
import { Spinner } from "@/components/ui/spinner"
import { getAgent } from "@/lib/mock-data"
import type { ChatMessage, Conversation, Source } from "@/lib/types"

export function ChatThread({
  conversation,
  isStreaming,
  onResolveHitl,
  onPickSuggestion,
}: {
  conversation: Conversation
  isStreaming: boolean
  onResolveHitl: (msgId: string, approved: boolean) => void
  onPickSuggestion: (q: string) => void
}) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // structured sources backing the latest answer (referenced inline as [n])
  const sources = conversation.sources ?? []
  const validIds = new Set(sources.map((s) => s.id))

  // citation panel state, lifted so inline [n] badges can drive it
  const [sourcesOpen, setSourcesOpen] = useState(false)
  const [activeSourceId, setActiveSourceId] = useState<number | null>(null)

  const handleCitationClick = (id: number) => {
    setSourcesOpen(true)
    setActiveSourceId(id)
  }

  // only the most recent assistant message carries the current citations
  const lastAssistantId = [...conversation.messages].reverse().find((m) => m.role === "assistant")?.id

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation.messages, conversation.suggestions])

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="space-y-6">
        {conversation.messages.map((m) =>
          m.role === "user" ? (
            <UserMessage key={m.id} message={m} />
          ) : (
            <AssistantMessage
              key={m.id}
              message={m}
              onResolveHitl={onResolveHitl}
              citations={
                m.id === lastAssistantId && validIds.size > 0
                  ? { validIds, onCitationClick: handleCitationClick }
                  : undefined
              }
            />
          ),
        )}
      </div>

      {/* answer sources — surfaced above the follow-up suggestions */}
      {!isStreaming && sources.length > 0 && (
        <SourcesBlock
          sources={sources}
          open={sourcesOpen}
          onToggle={() => setSourcesOpen((o) => !o)}
          activeId={activeSourceId}
        />
      )}

      {/* follow-up suggestions */}
      {!isStreaming && conversation.suggestions && conversation.suggestions.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            你可能还想问
          </p>
          <div className="flex flex-col gap-2">
            {conversation.suggestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => onPickSuggestion(q)}
                className="group flex items-center gap-2 self-start rounded-full border border-primary/30 bg-primary/5 py-1.5 pl-4 pr-3 text-sm text-foreground transition-colors hover:bg-primary/10"
              >
                {q}
                <ArrowUpRight className="size-3.5 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}

function SourcesBlock({
  sources,
  open,
  onToggle,
  activeId,
}: {
  sources: Source[]
  open: boolean
  onToggle: () => void
  activeId: number | null
}) {
  const itemRefs = useRef<Record<number, HTMLLIElement | null>>({})

  // scroll the cited source into view + briefly highlight when activated
  useEffect(() => {
    if (open && activeId != null) {
      itemRefs.current[activeId]?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }, [open, activeId])

  const webCount = sources.filter((s) => s.type === "web").length
  const kbCount = sources.filter((s) => s.type === "knowledge").length

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-border bg-muted/30">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
      >
        <BookOpen className="size-4 text-primary" />
        <span>查看信息来源</span>
        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
          {sources.length}
        </span>
        <span className="ml-1 hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
          {webCount > 0 && (
            <span className="flex items-center gap-1">
              <Globe className="size-3" />
              网页 {webCount}
            </span>
          )}
          {kbCount > 0 && (
            <span className="flex items-center gap-1">
              <Library className="size-3" />
              知识库 {kbCount}
            </span>
          )}
        </span>
        <ChevronDown className={cn("ml-auto size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <ul className="space-y-2 border-t border-border p-3">
          {sources.map((s) => {
            const isWeb = s.type === "web"
            const Icon = isWeb ? Globe : Library
            const active = activeId === s.id
            const body = (
              <>
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold",
                    active ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground",
                  )}
                >
                  {s.id}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate text-sm font-medium text-foreground">{s.title}</span>
                    {isWeb && <ExternalLink className="size-3 shrink-0 text-muted-foreground" />}
                  </div>
                  {s.snippet && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{s.snippet}</p>}
                  <span className="mt-1 inline-block text-[11px] text-muted-foreground/70">
                    {isWeb ? s.url : `知识库 · ${s.collection ?? ""}`}
                  </span>
                </div>
              </>
            )
            return (
              <li
                key={s.id}
                ref={(el) => {
                  itemRefs.current[s.id] = el
                }}
              >
                {isWeb && s.url ? (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex items-start gap-2 rounded-lg border p-2.5 transition-colors",
                      active ? "border-primary/50 bg-primary/5" : "border-border bg-background hover:bg-muted/50",
                    )}
                  >
                    {body}
                  </a>
                ) : (
                  <div
                    className={cn(
                      "flex items-start gap-2 rounded-lg border p-2.5",
                      active ? "border-primary/50 bg-primary/5" : "border-border bg-background",
                    )}
                  >
                    {body}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function UserMessage({ message }: { message: ChatMessage }) {
  const text = message.parts.map((p) => ("text" in p ? p.text : "")).join("")
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
        {text}
      </div>
    </div>
  )
}

function AssistantMessage({
  message,
  onResolveHitl,
  citations,
}: {
  message: ChatMessage
  onResolveHitl: (msgId: string, approved: boolean) => void
  citations?: { validIds: Set<number>; onCitationClick: (id: number) => void }
}) {
  const agent = getAgent(message.agentId)
  const empty = message.parts.length === 0
  return (
    <div className="flex gap-3">
      <img
        src={agent?.avatar || "/agents/general.png"}
        alt=""
        className="size-8 shrink-0 rounded-full object-cover"
      />
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{agent?.name ?? "智能体"}</span>
          {message.usage && <TokenUsageBadge usage={message.usage} />}
        </div>

        {empty && message.streaming && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner className="size-4" />
            思考中…
          </div>
        )}

        {message.parts.map((part, i) => {
          switch (part.type) {
            case "reasoning":
              return <ReasoningBlock key={i} text={part.text} streaming={!!message.streaming} />
            case "tool":
              return <ToolBlock key={i} part={part} />
            case "hitl":
              return <HitlBlock key={i} part={part} onResolve={(a) => onResolveHitl(message.id, a)} />
            case "text":
              return <Markdown key={i} text={part.text} citations={citations} />
            default:
              return null
          }
        })}
      </div>
    </div>
  )
}
