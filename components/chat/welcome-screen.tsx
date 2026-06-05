"use client"

import { Sparkles } from "lucide-react"
import { AGENTS } from "@/lib/mock-data"
import type { Agent, AgentId } from "@/lib/types"

export function WelcomeScreen({
  agent,
  onSelectAgent,
  onPickQuestion,
}: {
  agent: Agent | undefined
  onSelectAgent: (id: AgentId) => void
  onPickQuestion: (q: string) => void
}) {
  // No agent selected yet — show the picker grid
  if (!agent) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 px-4 py-10">
        <div className="text-center">
          <h1 className="text-balance text-2xl font-bold text-foreground md:text-3xl">选择一个智能体开始对话</h1>
          <p className="mt-2 text-pretty text-sm text-muted-foreground">
            每个智能体擅长不同的任务，也可以在输入框中用 @ 随时切换。
          </p>
        </div>
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          {AGENTS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => onSelectAgent(a.id)}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-accent/50"
            >
              <img src={a.avatar || "/placeholder.svg"} alt="" className="size-11 shrink-0 rounded-full object-cover" />
              <div>
                <p className="font-semibold text-foreground">{a.name}</p>
                <p className="text-xs text-primary">{a.tagline}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{a.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Agent selected — show greeting + sample questions
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 px-4 py-10">
      <img src={agent.avatar || "/placeholder.svg"} alt="" className="size-16 rounded-full object-cover ring-4 ring-primary/10" />
      <div className="text-center">
        <h1 className="text-balance text-2xl font-bold text-foreground md:text-3xl">你好，我是{agent.name}</h1>
        <p className="mx-auto mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">{agent.greeting}</p>
      </div>
      <div className="w-full">
        <p className="mb-2 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          试试这些问题
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {agent.sampleQuestions.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onPickQuestion(q)}
              className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-accent/50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
