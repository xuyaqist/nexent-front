"use client"

import { useState } from "react"
import {
  Brain,
  ChevronDown,
  Wrench,
  ShieldQuestion,
  Check,
  X,
  Coins,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { HitlPart, ToolPart, TokenUsage } from "@/lib/types"

/* ---------------- Thinking chain ---------------- */
export function ReasoningBlock({ text, streaming }: { text: string; streaming: boolean }) {
  const [open, setOpen] = useState(true)
  if (!text) return null
  return (
    <div className="rounded-xl border border-border bg-muted/40">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-muted-foreground"
      >
        <Brain className={cn("size-4 text-primary", streaming && "animate-pulse")} />
        <span>思考过程</span>
        {streaming && <span className="text-xs text-primary">推理中…</span>}
        <ChevronDown className={cn("ml-auto size-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <p className="whitespace-pre-wrap border-t border-border px-3 py-2 text-sm leading-relaxed text-muted-foreground">
          {text}
        </p>
      )}
    </div>
  )
}

/* ---------------- Tool call ---------------- */
export function ToolBlock({ part }: { part: ToolPart }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm"
      >
        <Wrench className={cn("size-4 text-muted-foreground", part.status === "running" && "animate-spin text-primary")} />
        <span className="font-medium text-foreground">{part.name}</span>
        <Badge variant={part.status === "running" ? "secondary" : "outline"} className="text-[11px]">
          {part.status === "running" ? "调用中" : "已完成"}
        </Badge>
        <ChevronDown className={cn("ml-auto size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="space-y-2 border-t border-border px-3 py-2 font-mono text-xs">
          <div>
            <span className="text-muted-foreground">输入：</span>
            <span className="break-all text-foreground">{part.input}</span>
          </div>
          {part.output && (
            <div>
              <span className="text-muted-foreground">输出：</span>
              <span className="break-all text-foreground">{part.output}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ---------------- Human in the loop ---------------- */
export function HitlBlock({
  part,
  onResolve,
}: {
  part: HitlPart
  onResolve: (approved: boolean) => void
}) {
  const pending = part.status === "pending"
  return (
    <div
      className={cn(
        "rounded-xl border p-3",
        pending ? "border-amber-300 bg-amber-50" : "border-border bg-muted/40",
      )}
    >
      <div className="mb-1 flex items-center gap-2">
        <ShieldQuestion className={cn("size-4", pending ? "text-amber-600" : "text-muted-foreground")} />
        <span className="text-sm font-semibold text-foreground">{part.title}</span>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">{part.description}</p>
      {pending ? (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onResolve(true)}>
            <Check className="size-4" />
            {part.action}
          </Button>
          <Button size="sm" variant="outline" onClick={() => onResolve(false)}>
            <X className="size-4" />
            取消
          </Button>
        </div>
      ) : (
        <Badge variant={part.status === "approved" ? "default" : "secondary"}>
          {part.status === "approved" ? "已授权执行" : "已取消"}
        </Badge>
      )}
    </div>
  )
}

/* ---------------- Token usage ---------------- */
export function TokenUsageBadge({ usage }: { usage: TokenUsage }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          <Coins className="size-3" />
          {usage.total.toLocaleString()} tokens
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <div className="space-y-0.5 text-xs">
          <div>输入：{usage.prompt.toLocaleString()} tokens</div>
          <div>输出：{usage.completion.toLocaleString()} tokens</div>
          <div className="font-medium">合计：{usage.total.toLocaleString()} tokens</div>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
