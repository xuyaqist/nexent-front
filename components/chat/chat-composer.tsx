"use client"

import { useRef, useState } from "react"
import { ArrowUp, Mic, Paperclip, ChevronDown, AtSign, Slash, Bot, Square } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AGENTS } from "@/lib/mock-data"
import type { Agent, AgentId } from "@/lib/types"

interface MentionState {
  type: "agent" | "skill"
  query: string
  tokenStart: number
}

export function ChatComposer({
  selectedAgent,
  onSelectAgent,
  onSend,
  isStreaming,
  onStop,
}: {
  selectedAgent: Agent | undefined
  onSelectAgent: (id: AgentId) => void
  onSend: (text: string) => void
  isStreaming?: boolean
  onStop?: () => void
}) {
  const [value, setValue] = useState("")
  const [mention, setMention] = useState<MentionState | null>(null)
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
        {/* agent picker */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              {selectedAgent ? (
                <>
                  <img src={selectedAgent.avatar || "/placeholder.svg"} alt="" className="size-4 rounded-full object-cover" />
                  {selectedAgent.name}
                </>
              ) : (
                <>
                  <Bot className="size-4" />
                  请选择智能体
                </>
              )}
              <ChevronDown className="size-3.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {AGENTS.map((a) => (
              <DropdownMenuItem key={a.id} onClick={() => onSelectAgent(a.id)} className="gap-2">
                <img src={a.avatar || "/placeholder.svg"} alt="" className="size-6 rounded-full object-cover" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{a.name}</span>
                  <span className="text-xs text-muted-foreground">{a.tagline}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

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
