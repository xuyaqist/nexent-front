"use client"

import { useRef, useState } from "react"
import { ArrowUp, Mic, Paperclip, AtSign, Slash, Square, Lightbulb, Play, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AGENTS } from "@/lib/mock-data"
import type { Agent, AgentId } from "@/lib/types"

type ChatMode = "planning" | "execution"

interface TokenUsage {
  prompt: number
  completion: number
  total: number
}

interface MentionState {
  type: "agent" | "skill"
  query: string
  tokenStart: number
}

const MAX_CONTEXT_TOKENS = 128000 // Simulated max context window

export function ChatComposer({
  selectedAgent,
  onSelectAgent,
  onSend,
  isStreaming,
  onStop,
  chatMode,
  onModeChange,
  tokenUsage,
}: {
  selectedAgent: Agent | undefined
  onSelectAgent: (id: AgentId) => void
  onSend: (text: string) => void
  isStreaming?: boolean
  onStop?: () => void
  chatMode: ChatMode
  onModeChange: (mode: ChatMode) => void
  tokenUsage: TokenUsage | null
}) {
  const [value, setValue] = useState("")
  const [mention, setMention] = useState<MentionState | null>(null)
  const [tokenExpanded, setTokenExpanded] = useState(false)
  const taRef = useRef<HTMLTextAreaElement>(null)

  const skillSource = selectedAgent ?? AGENTS[0]

  function detectMention(text: string, caret: number) {
    const before = text.slice(0, caret)
    const match = before.match(/(^|\s)([@/])([\u4e00-\u9fa5\w-]*)$/)
    if (!match) {
      setMention(null)
      return
    }
    const trigger = match[2]
    const query = match[3]
    const tokenStart = caret - query.length - 1
    setMention({ type: trigger === "@" ? "agent" : "skill", query, tokenStart })
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value
    setValue(text)
    detectMention(text, e.target.selectionStart ?? text.length)
  }

  function insertMention(label: string) {
    if (!mention) return
    const caret = (taRef.current?.selectionStart ?? value.length)
    const next = value.slice(0, mention.tokenStart) + (mention.type === "agent" ? "@" : "/") + label + " " + value.slice(caret)
    setValue(next)
    setMention(null)
    requestAnimationFrame(() => taRef.current?.focus())
  }

  function pickAgent(agent: Agent) {
    onSelectAgent(agent.id)
    insertMention(agent.name)
  }

  function submit() {
    // sending while streaming auto-interrupts the previous run (handled upstream)
    if (!value.trim() || !selectedAgent) return
    onSend(value)
    setValue("")
    setMention(null)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (mention && e.key === "Escape") {
      setMention(null)
      return
    }
    if (e.key === "Enter" && !e.shiftKey && !mention) {
      e.preventDefault()
      submit()
    }
  }

  const filteredAgents = AGENTS.filter((a) => a.name.includes(mention?.query ?? ""))
  const filteredSkills = skillSource.skills.filter(
    (s) => s.name.includes(mention?.query ?? "") || (mention?.query ?? "") === "",
  )

  return (
    <div className="relative rounded-2xl border border-border bg-card shadow-sm">
      {/* Mode switcher (left) and Token usage (right) above input */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        {/* Mode switcher */}
        <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5">
          <Button
            variant={chatMode === "planning" ? "secondary" : "ghost"}
            size="sm"
            className="h-6 gap-1 rounded-md px-2 text-xs"
            onClick={() => onModeChange("planning")}
          >
            <Lightbulb className="size-3" />
            规划
          </Button>
          <Button
            variant={chatMode === "execution" ? "secondary" : "ghost"}
            size="sm"
            className="h-6 gap-1 rounded-md px-2 text-xs"
            onClick={() => onModeChange("execution")}
          >
            <Play className="size-3" />
            执行
          </Button>
        </div>

        {/* Token usage - clickable to expand */}
        {tokenUsage && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setTokenExpanded(!tokenExpanded)}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted"
            >
              <Zap className="size-3 text-amber-500" />
              <span className="font-medium text-foreground">
                {Math.round((tokenUsage.total / MAX_CONTEXT_TOKENS) * 100)}%
              </span>
              <span className="text-muted-foreground/70">已使用</span>
            </button>

            {/* Expanded details popover */}
            {tokenExpanded && (
              <div className="absolute right-0 top-full z-50 mt-1 w-64 rounded-lg border border-border bg-popover p-3 shadow-lg">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">Token 使用详情</span>
                  <button
                    type="button"
                    onClick={() => setTokenExpanded(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <span className="sr-only">关闭</span>
                    <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">上下文使用</span>
                    <span className="font-medium text-foreground">
                      {tokenUsage.total.toLocaleString()} / {MAX_CONTEXT_TOKENS.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all"
                      style={{ width: `${Math.min((tokenUsage.total / MAX_CONTEXT_TOKENS) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="size-2 rounded-full bg-blue-500" />
                      输入 Token
                    </span>
                    <span className="font-medium text-foreground">{tokenUsage.prompt.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="size-2 rounded-full bg-green-500" />
                      输出 Token
                    </span>
                    <span className="font-medium text-foreground">{tokenUsage.completion.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-border pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">总计</span>
                      <span className="font-semibold text-foreground">{tokenUsage.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* mention dropdown */}
      {mention && (
        <div className="absolute bottom-full left-3 mb-2 w-72 overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
          <div className="flex items-center gap-1.5 border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground">
            {mention.type === "agent" ? <AtSign className="size-3.5" /> : <Slash className="size-3.5" />}
            {mention.type === "agent" ? "选择智能体" : `选择技能 · ${skillSource.name}`}
          </div>
          <ul className="max-h-60 overflow-y-auto p-1">
            {mention.type === "agent"
              ? filteredAgents.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => pickAgent(a)}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-accent"
                    >
                      <img src={a.avatar || "/placeholder.svg"} alt="" className="size-6 rounded-full object-cover" />
                      <span className="font-medium">{a.name}</span>
                      <span className="ml-auto truncate text-xs text-muted-foreground">{a.tagline}</span>
                    </button>
                  </li>
                ))
              : filteredSkills.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => insertMention(s.name)}
                      className="flex w-full flex-col rounded-lg px-2 py-1.5 text-left hover:bg-accent"
                    >
                      <span className="text-sm font-medium">/{s.name}</span>
                      <span className="text-xs text-muted-foreground">{s.description}</span>
                    </button>
                  </li>
                ))}
            {mention.type === "agent" && filteredAgents.length === 0 && (
              <li className="px-2 py-2 text-sm text-muted-foreground">无匹配智能体</li>
            )}
          </ul>
        </div>
      )}

      <textarea
        ref={taRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        rows={2}
        placeholder={
          selectedAgent ? `给 ${selectedAgent.name} 发送消息，输入 @ 切换智能体，/ 选择技能` : "请先选择一个智能体开始对话"
        }
        className="block w-full resize-none rounded-t-2xl bg-transparent px-4 pt-3 text-sm outline-none placeholder:text-muted-foreground"
      />

      <div className="flex items-center gap-2 px-3 pb-3 pt-1">
        <div className="ml-auto flex items-center gap-1">
          <Button size="icon" variant="ghost" className="text-muted-foreground" aria-label="语音输入">
            <Mic className="size-5" />
          </Button>
          <Button size="icon" variant="ghost" className="text-muted-foreground" aria-label="上传附件">
            <Paperclip className="size-5" />
          </Button>
          {isStreaming && !value.trim() ? (
            <Button
              size="icon"
              variant="secondary"
              onClick={onStop}
              aria-label="停止生成"
              className="rounded-full"
            >
              <Square className="size-4 fill-current" />
            </Button>
          ) : (
            <Button
              size="icon"
              onClick={submit}
              disabled={!value.trim() || !selectedAgent}
              aria-label={isStreaming ? "终止并发送" : "发送"}
              className={cn("rounded-full")}
            >
              <ArrowUp className="size-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
