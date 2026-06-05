"use client"

import { useEffect, useRef } from "react"
import { Sparkles, ArrowUpRight } from "lucide-react"
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
