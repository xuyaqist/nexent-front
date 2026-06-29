"use client"

import { useEffect, useState } from "react"
import { ListChecks, CircleCheck, CircleDot, Circle, ChevronDown, Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Conversation, PlanStep, TaskStatus } from "@/lib/types"

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

export function TaskPanelInline({ conversation }: { conversation: Conversation }) {
  const plan = conversation.plan
  const status = conversation.taskStatus ?? "idle"
  const meta = statusMeta[status]

  const doneCount = plan?.steps.filter((s) => s.status === "done").length ?? 0
  const total = plan?.steps.length ?? 0
  const isComplete = status === "done" || status === "stopped"

  // Expanded by default while the task is not yet finished
  const [expanded, setExpanded] = useState(true)

  // Auto-collapse once the task is complete, auto-expand while running
  useEffect(() => {
    setExpanded(!isComplete)
  }, [isComplete])

  if (!plan || total === 0) return null

  return (
    <div className="mb-2 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* header — always visible, toggles expansion */}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
      >
        <Layers className="size-4 shrink-0 text-primary" />
        <span className="truncate text-sm font-semibold text-foreground">
          {plan.title ?? "执行计划"}
        </span>
        <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium", meta.className)}>
          {meta.label}
        </span>
        {plan.revised && (
          <Badge variant="secondary" className="shrink-0 text-[11px]">
            已更新策略
          </Badge>
        )}
        <span className="ml-auto shrink-0 text-xs tabular-nums text-muted-foreground">
          {doneCount}/{total}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>

      {/* progress bar — hidden when task is complete and panel is collapsed */}
      {!(isComplete && !expanded) && (
        <div className={cn("px-3", !expanded && "pb-2.5")}>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${total ? (doneCount / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* step list — collapsible */}
      {expanded && (
        <ol className="max-h-56 space-y-2.5 overflow-y-auto px-3 py-3">
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
      )}
    </div>
  )
}
