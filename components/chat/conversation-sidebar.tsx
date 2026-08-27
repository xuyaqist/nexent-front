"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, PanelLeftClose, PanelLeft, ChevronDown, Loader2, History } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Conversation } from "@/lib/types"
import { getAgent } from "@/lib/mock-data"

/** how many conversations are revealed initially and per "加载更多" click */
const PAGE_SIZE = 15

function groupByTime(conversations: Conversation[]) {
  const now = Date.now()
  const day = 1000 * 60 * 60 * 24
  const groups: { label: string; items: Conversation[] }[] = [
    { label: "今天", items: [] },
    { label: "昨天", items: [] },
    { label: "更早", items: [] },
  ]
  for (const c of conversations) {
    const age = now - c.updatedAt
    if (age < day) groups[0].items.push(c)
    else if (age < day * 2) groups[1].items.push(c)
    else groups[2].items.push(c)
  }
  return groups.filter((g) => g.items.length > 0)
}

export function ConversationSidebar({
  conversations,
  activeId,
  collapsed,
  onToggle,
  onSelect,
  onNew,
  onSwitchLegacy,
}: {
  conversations: Conversation[]
  activeId: string | null
  collapsed: boolean
  onToggle: () => void
  onSelect: (id: string) => void
  onNew: () => void
  onSwitchLegacy?: () => void
}) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [loadingMore, setLoadingMore] = useState(false)

  // newest first, so pagination always reveals older conversations
  const sorted = useMemo(
    () => [...conversations].sort((a, b) => b.updatedAt - a.updatedAt),
    [conversations],
  )

  // keep the active conversation reachable even if it sits past the current page
  useEffect(() => {
    if (!activeId) return
    const idx = sorted.findIndex((c) => c.id === activeId)
    if (idx >= 0 && idx >= visibleCount) {
      setVisibleCount(Math.ceil((idx + 1) / PAGE_SIZE) * PAGE_SIZE)
    }
  }, [activeId, sorted, visibleCount])

  // a brand new conversation should never be hidden behind "加载更多"
  useEffect(() => {
    if (sorted.length <= PAGE_SIZE) setVisibleCount(PAGE_SIZE)
  }, [sorted.length])

  if (collapsed) {
    return (
      <div className="flex h-full w-14 flex-col items-center gap-3 border-r border-sidebar-border bg-sidebar py-4">
        <Button size="icon" variant="ghost" onClick={onToggle} aria-label="展开侧边栏">
          <PanelLeft className="size-5" />
        </Button>
        <Button size="icon" variant="ghost" onClick={onNew} aria-label="新对话">
          <Plus className="size-5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onSwitchLegacy}
          aria-label="切换旧版"
          className="mt-auto text-muted-foreground"
        >
          <History className="size-5" />
        </Button>
      </div>
    )
  }

  const visible = sorted.slice(0, visibleCount)
  const remaining = sorted.length - visible.length
  const groups = groupByTime(visible)

  function loadMore() {
    setLoadingMore(true)
    // simulates fetching the next page from the server
    setTimeout(() => {
      setVisibleCount((n) => n + PAGE_SIZE)
      setLoadingMore(false)
    }, 400)
  }

  return (
    <aside className="flex h-full w-72 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center gap-2 p-3">
        <Button onClick={onNew} className="flex-1 justify-start gap-2" variant="outline">
          <Plus className="size-4" />
          新对话
        </Button>
        <Button size="icon" variant="ghost" onClick={onToggle} aria-label="收起侧边栏">
          <PanelLeftClose className="size-5" />
        </Button>
      </div>

      <ScrollArea className="min-h-0 flex-1 px-2">
        <nav className="pb-4">
          {groups.map((group) => (
            <div key={group.label} className="mb-3">
              <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{group.label}</p>
              <ul className="space-y-0.5">
                {group.items.map((c) => {
                  const agent = getAgent(c.agentId)
                  const active = c.id === activeId
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(c.id)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/60",
                        )}
                      >
                        {agent && (
                          <img
                            src={agent.avatar || "/placeholder.svg"}
                            alt=""
                            className="size-5 shrink-0 rounded-full object-cover"
                          />
                        )}
                        <span className="truncate">{c.title}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}

          {/* pagination — reveals older conversations on demand */}
          {remaining > 0 ? (
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground disabled:opacity-60"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  加载中...
                </>
              ) : (
                <>
                  <ChevronDown className="size-3.5" />
                  加载更多
                  <span className="text-muted-foreground/70">（还有 {remaining} 条）</span>
                </>
              )}
            </button>
          ) : (
            sorted.length > PAGE_SIZE && (
              <p className="mt-1 px-2 py-2 text-center text-xs text-muted-foreground/60">
                已显示全部 {sorted.length} 条会话
              </p>
            )
          )}
        </nav>
      </ScrollArea>

      {/* footer — pinned below the scrolling list */}
      <div className="shrink-0 border-t border-sidebar-border p-2">
        <button
          type="button"
          onClick={onSwitchLegacy}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        >
          <History className="size-4" />
          切换旧版
        </button>
      </div>
    </aside>
  )
}
