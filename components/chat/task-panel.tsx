"use client"

import { useMemo } from "react"
import {
  ListChecks,
  CircleCheck,
  CircleDot,
  Circle,
  Layers,
  Bot,
  Wrench,
  FileText,
  MessageSquare,
  Activity,
  X,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ContextItem, Conversation, PlanStep, TaskStatus, TokenUsage } from "@/lib/types"

const stepIcon: Record<PlanStep["status"], React.ReactNode> = {
  done: <CircleCheck className="size-4 shrink-0 text-primary" />,
  in_progress: <CircleDot className="size-4 shrink-0 animate-pulse text-primary" />,
  pending: <Circle className="size-4 shrink-0 text-muted-foreground/40" />,
}

const statusMeta: Record<TaskStatus, { label: string; className: string }> = {
  idle: { label: "待开始", className: "bg-muted text-muted-foreground" },
  running: { label: "执行中", className: "bg-primary/10 text-primary" },
  awaiting: { label: "等待确认", className: "bg-amber-100 text-amber-700" },
  done: { label: "已完成", className: "bg-primary/10 text-primary" },
  stopped: { label: "已终止", className: "bg-destructive/10 text-destructive" },
}

const ctxIcon: Record<ContextItem["kind"], React.ReactNode> = {
  agent: <Bot className="size-3.5 text-primary" />,
  status: <Activity className="size-3.5 text-primary" />,
  request: <MessageSquare className="size-3.5 text-muted-foreground" />,
  tool: <Wrench className="size-3.5 text-muted-foreground" />,
  source: <FileText className="size-3.5 text-muted-foreground" />,
  memory: <Layers className="size-3.5 text-muted-foreground" />,
}

// Model context window size (can be made configurable)
const MODEL_CONTEXT_WINDOW = 128000

function formatTokens(n: number): string {
  if (n >= 1000) {
    return (n / 1000).toFixed(1) + "k"
  }
  return n.toString()
}

function TokenUsageDisplay({ usage }: { usage: TokenUsage | null }) {
  if (!usage) {
    return (
      <div className="flex flex-col items-center justify-center py-4 text-sm text-muted-foreground">
        <Zap className="mb-2 size-5 opacity-50" />
        <span>暂无 Token 使用数据</span>
      </div>
    )
  }

  const percentage = Math.min((usage.total / MODEL_CONTEXT_WINDOW) * 100, 100)

  return (
    <div className="space-y-3">
      {/* Usage percentage bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">上下文使用</span>
          <span className="font-medium text-foreground">{percentage.toFixed(1)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              percentage < 50 ? "bg-primary" : percentage < 80 ? "bg-amber-500" : "bg-destructive"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Token breakdown */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-muted/50 p-2.5">
          <div className="text-[11px] text-muted-foreground">输入 Tokens</div>
          <div className="text-sm font-semibold text-foreground">{formatTokens(usage.prompt)}</div>
        </div>
        <div className="rounded-lg bg-muted/50 p-2.5">
          <div className="text-[11px] text-muted-foreground">输出 Tokens</div>
          <div className="text-sm font-semibold text-foreground">{formatTokens(usage.completion)}</div>
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-card p-2.5">
        <span className="text-xs text-muted-foreground">总计</span>
        <span className="text-sm font-semibold text-foreground">
          {formatTokens(usage.total)} / {formatTokens(MODEL_CONTEXT_WINDOW)}
        </span>
      </div>
    </div>
  )
}

export function TaskPanel({
  conversation,
  onClose,
}: {
  conversation: Conversation
  onClose: () => void
}) {
  const plan = conversation.plan
  const context = conversation.context ?? []
  const status = conversation.taskStatus ?? "idle"
  const meta = statusMeta[status]

  const doneCount = plan?.steps.filter((s) => s.status === "done").length ?? 0
  const total = plan?.steps.length ?? 0

  // Calculate cumulative token usage from all assistant messages
  const tokenUsage = useMemo(() => {
    const messages = conversation.messages
    let totalPrompt = 0
    let totalCompletion = 0

    for (const msg of messages) {
      if (msg.role === "assistant" && msg.usage) {
        totalPrompt += msg.usage.prompt
        totalCompletion += msg.usage.completion
      }
    }

    if (totalPrompt === 0 && totalCompletion === 0) {
      return null
    }

    return {
      prompt: totalPrompt,
      completion: totalCompletion,
      total: totalPrompt + totalCompletion,
    }
  }, [conversation.messages])

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l border-border bg-sidebar">
      {/* header */}
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
        <Layers className="size-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">任务面板</span>
        <span className={cn("ml-1 rounded-full px-2 py-0.5 text-[11px] font-medium", meta.className)}>
          {meta.label}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto size-7 text-muted-foreground"
          onClick={onClose}
          aria-label="关闭任务面板"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* top: to-do list */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="mb-3 flex items-center gap-2">
            <ListChecks className="size-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              {plan?.title ?? "执行计划"}
            </span>
            {plan?.revised && (
              <Badge variant="secondary" className="text-[11px]">
                已更新策略
              </Badge>
            )}
            {total > 0 && (
              <span className="ml-auto text-xs text-muted-foreground">
                {doneCount}/{total}
              </span>
            )}
          </div>

          {plan && total > 0 ? (
            <>
              {/* progress bar */}
              <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${total ? (doneCount / total) * 100 : 0}%` }}
                />
              </div>
              <ol className="space-y-2.5">
                {plan.steps.map((s, i) => (
                  <li key={s.id} className="flex items-start gap-2.5 text-sm">
                    {stepIcon[s.status]}
                    <span
                      className={cn(
                        "leading-snug",
                        s.status === "done" &&
                        "text-muted-foreground line-through decoration-muted-foreground/40",
                        s.status === "in_progress" && "font-medium text-foreground",
                        s.status === "pending" && "text-muted-foreground",
                      )}
                    >
                      <span className="mr-1 tabular-nums text-muted-foreground/60">{i + 1}.</span>
                      {s.title}
                    </span>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">当前任务暂无策略计划。</p>
          )}
        </div>


      </div>
    </aside>
  )
}
