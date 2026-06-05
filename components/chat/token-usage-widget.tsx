"use client"

import { useState } from "react"
import { Zap, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TokenUsage } from "@/lib/types"

// Model context window size
const MODEL_CONTEXT_WINDOW = 128000

function formatTokens(n: number): string {
  if (n >= 1000) {
    return (n / 1000).toFixed(1) + "k"
  }
  return n.toString()
}

interface TokenUsageWidgetProps {
  usage: TokenUsage | null
  className?: string
}

export function TokenUsageWidget({ usage, className }: TokenUsageWidgetProps) {
  const [expanded, setExpanded] = useState(false)

  if (!usage) {
    return null
  }

  const percentage = Math.min((usage.total / MODEL_CONTEXT_WINDOW) * 100, 100)

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card shadow-lg transition-all duration-200",
        expanded ? "w-64" : "w-auto",
        className
      )}
    >
      {/* Collapsed view - clickable header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-accent/50 transition-colors"
      >
        <Zap className="size-4 text-primary" />
        <span className="text-xs font-medium text-foreground">Token</span>
        <span
          className={cn(
            "ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
            percentage < 50
              ? "bg-primary/10 text-primary"
              : percentage < 80
              ? "bg-amber-100 text-amber-700"
              : "bg-destructive/10 text-destructive"
          )}
        >
          {percentage.toFixed(0)}%
        </span>
        {expanded ? (
          <ChevronDown className="ml-auto size-3.5 text-muted-foreground" />
        ) : (
          <ChevronUp className="ml-auto size-3.5 text-muted-foreground" />
        )}
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-border px-3 pb-3 pt-2 space-y-2.5">
          {/* Usage percentage bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">上下文使用</span>
              <span className="font-medium text-foreground">{percentage.toFixed(1)}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  percentage < 50
                    ? "bg-primary"
                    : percentage < 80
                    ? "bg-amber-500"
                    : "bg-destructive"
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Token breakdown */}
          <div className="grid grid-cols-2 gap-1.5">
            <div className="rounded-lg bg-muted/50 p-2">
              <div className="text-[10px] text-muted-foreground">输入</div>
              <div className="text-xs font-semibold text-foreground">
                {formatTokens(usage.prompt)}
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-2">
              <div className="text-[10px] text-muted-foreground">输出</div>
              <div className="text-xs font-semibold text-foreground">
                {formatTokens(usage.completion)}
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-background p-2">
            <span className="text-[10px] text-muted-foreground">总计</span>
            <span className="text-xs font-semibold text-foreground">
              {formatTokens(usage.total)} / {formatTokens(MODEL_CONTEXT_WINDOW)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
