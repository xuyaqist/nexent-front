"use client"

import { useState } from "react"
import { ChevronRight, Globe, Plus, RefreshCw, Settings2, Lightbulb, Check } from "lucide-react"
import { TOOL_GROUPS, TOOL_SOURCES } from "@/lib/types"
import { cn } from "@/lib/utils"

interface CapabilityPanelProps {
  selectedTools: string[]
  onToggleTool: (tool: string) => void
}

export function AgentCapabilityPanel({ selectedTools, onToggleTool }: CapabilityPanelProps) {
  const [activeTab, setActiveTab] = useState<"tools" | "skills">("tools")
  const [activeSource, setActiveSource] = useState("本地工具")
  const [openGroups, setOpenGroups] = useState<string[]>(["database"])

  const toggleGroup = (cat: string) =>
    setOpenGroups((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]))

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="mb-5 flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          1
        </span>
        <h2 className="text-base font-semibold text-foreground">配置智能体能力</h2>
      </div>

      {/* 选择协作智能体 */}
      <div className="mb-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">选择协作的智能体</span>
          <button className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700">
            <Globe className="size-4" />
            添加外部 Agent
          </button>
        </div>
        <button className="flex h-24 w-full items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
          <div className="flex size-9 items-center justify-center rounded-md border border-dashed border-current">
            <Plus className="size-4" />
          </div>
        </button>
      </div>

      {/* 工具 / 技能 切换 */}
      <div className="mb-3 grid grid-cols-2 rounded-lg border border-border p-1">
        <button
          onClick={() => setActiveTab("tools")}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors",
            activeTab === "tools" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
          )}
        >
          选择工具
          <Lightbulb className="size-3.5 text-amber-500" />
        </button>
        <button
          onClick={() => setActiveTab("skills")}
          className={cn(
            "flex items-center justify-center rounded-md py-2 text-sm font-medium transition-colors",
            activeTab === "skills" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
          )}
        >
          选择技能
        </button>
      </div>

      <div className="mb-4 flex items-center justify-end gap-4 text-sm">
        <button className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700">
          <RefreshCw className="size-3.5" />
          刷新工具
        </button>
        <button className="flex items-center gap-1 text-primary hover:text-primary/80">
          <Settings2 className="size-3.5" />
          MCP配置
        </button>
      </div>

      {/* 工具来源 + 工具列表 */}
      <div className="flex min-h-[340px] gap-3 border-t border-border pt-4">
        <nav className="flex w-28 shrink-0 flex-col gap-1">
          {TOOL_SOURCES.map((src) => (
            <button
              key={src}
              onClick={() => setActiveSource(src)}
              className={cn(
                "truncate border-l-2 py-2 pl-3 text-left text-sm transition-colors",
                activeSource === src
                  ? "border-primary font-medium text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {src}
            </button>
          ))}
        </nav>

        <div className="flex-1 space-y-2">
          {TOOL_GROUPS.map((group) => {
            const open = openGroups.includes(group.category)
            return (
              <div key={group.category} className="overflow-hidden rounded-lg border border-border">
                <button
                  onClick={() => toggleGroup(group.category)}
                  className="flex w-full items-center gap-2 bg-secondary/50 px-3 py-2.5 text-sm font-medium text-foreground"
                >
                  <ChevronRight className={cn("size-4 transition-transform", open && "rotate-90")} />
                  {group.category}
                </button>
                {open && (
                  <ul className="divide-y divide-border">
                    {group.tools.map((tool) => {
                      const selected = selectedTools.includes(tool)
                      return (
                        <li key={tool}>
                          <button
                            onClick={() => onToggleTool(tool)}
                            className="flex w-full items-center justify-between px-3 py-2 pl-9 text-left text-sm text-muted-foreground hover:bg-accent/50"
                          >
                            {tool}
                            <span
                              className={cn(
                                "flex size-4 items-center justify-center rounded border",
                                selected ? "border-primary bg-primary text-primary-foreground" : "border-border",
                              )}
                            >
                              {selected && <Check className="size-3" />}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
