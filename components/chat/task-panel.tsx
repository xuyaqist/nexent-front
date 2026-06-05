"use client"

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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ContextItem, Conversation, PlanStep, TaskStatus } from "@/lib/types"

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

        {/* bottom: context display */}
        <div className="shrink-0 border-t border-border">
          <div className="flex items-center gap-2 px-4 pb-2 pt-3">
            <Layers className="size-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">上下文显示</span>
          </div>
          <div className="max-h-56 space-y-1.5 overflow-y-auto px-4 pb-4">
            <div>Usage 72% </div>
            <div>Input 72.3k</div>
            <div>Cached  41.2k</div>
            <div>Output  12.7k</div>
            <div>Reasoning  8.4k</div>
            <div>Total   92.2k / 128.0k</div>

          </div>
        </div>
      </div>
    </aside>
  )
}
