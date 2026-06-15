"use client"

import { useEffect, useRef, useState } from "react"
import { Sparkles, ArrowUpRight, BookOpen, ChevronDown, Database, FileText, Globe, Brain } from "lucide-react"
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
import type { ChatMessage, Conversation } from "@/lib/types"

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

  // sources retrieved for the latest answer (surfaced from the context display)
  const sources = (conversation.context ?? [])
    .filter((c) => c.kind === "source")
    .map((c) => c.value)

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
            <AssistantMessage key={m.id} message={m} onResolveHitl={onResolveHitl} />
          ),
        )}
      </div>

      {/* answer sources — surfaced above the follow-up suggestions */}
      {!isStreaming && sources.length > 0 && <SourcesBlock sources={sources} />}

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

function sourceIcon(value: string) {
  const v = value.toLowerCase()
  if (v.includes("数据表") || v.includes("table") || v.includes("看板") || v.includes("sql")) return Database
  if (v.includes("文档") || v.includes("白皮书") || v.includes("doc") || v.includes("arxiv")) return FileText
  if (v.includes("检索") || v.includes("search") || v.includes("web") || v.includes("官方")) return Globe
  if (v.includes("历史") || v.includes("上下文") || v.includes("memory")) return Brain
  return BookOpen
}

function SourcesBlock({ sources }: { sources: string[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-border bg-muted/30">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
      >
        <BookOpen className="size-4 text-primary" />
        <span>查看信息来源</span>
        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
          {sources.length}
        </span>
        <ChevronDown className={cn("ml-auto size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <ul className="space-y-1.5 border-t border-border px-3 py-2.5">
          {sources.map((s, i) => {
            const Icon = sourceIcon(s)
            return (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-background text-[11px] font-medium text-muted-foreground">
                  {i + 1}
                </span>
                <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span className="text-foreground">{s}</span>
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
}: {
  message: ChatMessage
  onResolveHitl: (msgId: string, approved: boolean) => void
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
              return <Markdown key={i} text={part.text} />
            default:
              return null
          }
        })}
      </div>
    </div>
  )
}
