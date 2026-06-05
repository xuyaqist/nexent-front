"use client"

import { Plus, PanelLeftClose, PanelLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Conversation } from "@/lib/types"
import { getAgent } from "@/lib/mock-data"

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
}: {
  conversations: Conversation[]
  activeId: string | null
  collapsed: boolean
  onToggle: () => void
  onSelect: (id: string) => void
  onNew: () => void
}) {
  if (collapsed) {
    return (
      <div className="flex h-full w-14 flex-col items-center gap-3 border-r border-sidebar-border bg-sidebar py-4">
        <Button size="icon" variant="ghost" onClick={onToggle} aria-label="展开侧边栏">
          <PanelLeft className="size-5" />
        </Button>
        <Button size="icon" variant="ghost" onClick={onNew} aria-label="新对话">
          <Plus className="size-5" />
        </Button>
      </div>
    )
  }

  const groups = groupByTime(conversations)

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
      <ScrollArea className="flex-1 px-2">
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
        </nav>
      </ScrollArea>
    </aside>
  )
}
