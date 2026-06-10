"use client"

import { useState } from "react"
import { ChevronRight, Globe, Plus, RefreshCw, Settings2, Lightbulb, Check, Zap, Wrench, X, Search } from "lucide-react"
import { TOOL_GROUPS, TOOL_SOURCES, TOOL_TAGS, SKILL_GROUPS } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CapabilityPanelProps {
  selectedTools: string[]
  selectedSkills: string[]
  onToggleTool: (tool: string) => void
  onToggleSkill: (skill: string) => void
}

export function AgentCapabilityPanel({ selectedTools, selectedSkills, onToggleTool, onToggleSkill }: CapabilityPanelProps) {
  const [activeSource, setActiveSource] = useState("本地工具")
  const [openGroups, setOpenGroups] = useState<string[]>(["database"])
  const [openSkillGroups, setOpenSkillGroups] = useState<string[]>(["数据处理"])
  const [toolDialogOpen, setToolDialogOpen] = useState(false)
  const [skillDialogOpen, setSkillDialogOpen] = useState(false)
  const [toolQuery, setToolQuery] = useState("")
  const [skillQuery, setSkillQuery] = useState("")

  const toggleGroup = (cat: string) =>
    setOpenGroups((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]))

  const toggleSkillGroup = (cat: string) =>
    setOpenSkillGroups((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]))

  // 查找技能描述
  const findSkillDesc = (name: string) =>
    SKILL_GROUPS.flatMap((g) => g.skills).find((s) => s.name === name)?.description ?? ""

  // 将已选工具按分类分组（保持 TOOL_GROUPS 中的分类顺序）
  const groupedTools = TOOL_GROUPS.map((group) => ({
    category: group.category,
    items: group.tools.filter((t) => selectedTools.includes(t)),
  })).filter((g) => g.items.length > 0)

  // 将已选技能按分类分组（保持 SKILL_GROUPS 中的分类顺序）
  const groupedSkills = SKILL_GROUPS.map((group) => ({
    category: group.category,
    items: group.skills.map((s) => s.name).filter((name) => selectedSkills.includes(name)),
  })).filter((g) => g.items.length > 0)

  // 工具检索：按名称或标签匹配
  const toolMatches = (tool: string, q: string) => {
    const kw = q.trim().toLowerCase()
    if (!kw) return true
    if (tool.toLowerCase().includes(kw)) return true
    return (TOOL_TAGS[tool] ?? []).some((tag) => tag.toLowerCase().includes(kw))
  }

  // 过滤后的工具分组（保留含匹配工具的分类）
  const filteredToolGroups = TOOL_GROUPS.map((group) => ({
    category: group.category,
    tools: group.tools.filter((t) => toolMatches(t, toolQuery)),
  })).filter((g) => g.tools.length > 0)

  // 技能检索：按名称、描述或标签匹配
  const skillMatches = (skill: { name: string; description: string; tags: string[] }, q: string) => {
    const kw = q.trim().toLowerCase()
    if (!kw) return true
    if (skill.name.toLowerCase().includes(kw)) return true
    if (skill.description.toLowerCase().includes(kw)) return true
    return skill.tags.some((tag) => tag.toLowerCase().includes(kw))
  }

  // 过滤后的技能分组（保留含匹配技能的分类）
  const filteredSkillGroups = SKILL_GROUPS.map((group) => ({
    category: group.category,
    skills: group.skills.filter((s) => skillMatches(s, skillQuery)),
  })).filter((g) => g.skills.length > 0)

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

      {/* 已选择工具 */}
      <div className="mb-5 border-t border-border pt-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            已选择工具
            <Lightbulb className="size-3.5 text-amber-500" />
            <span className="text-xs text-muted-foreground">({selectedTools.length})</span>
          </span>
          <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={() => setToolDialogOpen(true)}>
            <Wrench className="size-3.5" />
            选择工具
          </Button>
        </div>
        {selectedTools.length > 0 ? (
          <div className="space-y-3">
            {groupedTools.map((group) => (
              <div key={group.category}>
                <div className="mb-2 text-xs font-medium text-muted-foreground">
                  {group.category}（{group.items.length}）
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((tool) => (
                    <Badge key={tool} variant="secondary" className="gap-1 py-1 pl-2.5 pr-1.5">
                      {tool}
                      <button
                        onClick={() => onToggleTool(tool)}
                        className="flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted-foreground/20 hover:text-foreground"
                        aria-label={`移除 ${tool}`}
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-6 text-sm text-muted-foreground">
            暂未选择工具，点击「选择工具」添加
          </div>
        )}
      </div>

      {/* 已选择技能 */}
      <div className="border-t border-border pt-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            已选择技能
            <Zap className="size-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">({selectedSkills.length})</span>
          </span>
          <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={() => setSkillDialogOpen(true)}>
            <Zap className="size-3.5" />
            选择技能
          </Button>
        </div>
        {selectedSkills.length > 0 ? (
          <div className="space-y-3">
            {groupedSkills.map((group) => (
              <div key={group.category}>
                <div className="mb-2 text-xs font-medium text-muted-foreground">
                  {group.category}（{group.items.length}）
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="gap-1 border-primary/30 py-1 pl-2.5 pr-1.5 text-primary"
                      title={findSkillDesc(skill)}
                    >
                      {skill}
                      <button
                        onClick={() => onToggleSkill(skill)}
                        className="flex size-4 items-center justify-center rounded-full transition-colors hover:bg-primary/10"
                        aria-label={`移除 ${skill}`}
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-6 text-sm text-muted-foreground">
            暂未选择技能，点击「选择技能」添加
          </div>
        )}
      </div>

      {/* 选择工具弹窗 */}
      <Dialog open={toolDialogOpen} onOpenChange={setToolDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="size-4" />
              选择工具
            </DialogTitle>
            <DialogDescription>从工具来源中选择智能体可调用的工具，已选择 {selectedTools.length} 个。</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={toolQuery}
              onChange={(e) => setToolQuery(e.target.value)}
              placeholder="搜索工具名称或标签，如「数据库」「邮件」…"
              className="pl-9"
            />
          </div>
          <div className="flex max-h-[60vh] min-h-[340px] gap-3">
            <nav className="flex w-28 shrink-0 flex-col gap-1 overflow-y-auto">
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

            <div className="flex-1 space-y-2 overflow-y-auto pr-1">
              {filteredToolGroups.length === 0 ? (
                <div className="flex h-full items-center justify-center py-12 text-sm text-muted-foreground">
                  未找到匹配「{toolQuery}」的工具
                </div>
              ) : (
                filteredToolGroups.map((group) => {
                  const open = openGroups.includes(group.category) || toolQuery.trim() !== ""
                  return (
                    <div key={group.category} className="overflow-hidden rounded-lg border border-border">
                      <button
                        onClick={() => toggleGroup(group.category)}
                        className="flex w-full items-center gap-2 bg-secondary/50 px-3 py-2.5 text-sm font-medium text-foreground"
                      >
                        <ChevronRight className={cn("size-4 transition-transform", open && "rotate-90")} />
                        {group.category}
                        <span className="text-xs text-muted-foreground">（{group.tools.length}）</span>
                      </button>
                      {open && (
                        <ul className="divide-y divide-border">
                          {group.tools.map((tool) => {
                            const selected = selectedTools.includes(tool)
                            return (
                              <li key={tool}>
                                <button
                                  onClick={() => onToggleTool(tool)}
                                  className="flex w-full items-center justify-between gap-3 px-3 py-2 pl-9 text-left text-sm text-muted-foreground hover:bg-accent/50"
                                >
                                  <span className="flex flex-1 flex-wrap items-center gap-2">
                                    <span className="text-foreground">{tool}</span>
                                    {(TOOL_TAGS[tool] ?? []).map((tag) => (
                                      <span
                                        key={tag}
                                        className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </span>
                                  <span
                                    className={cn(
                                      "flex size-4 shrink-0 items-center justify-center rounded border",
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
                })
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 选择技能弹窗 */}
      <Dialog open={skillDialogOpen} onOpenChange={setSkillDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="size-4" />
              选择技能
            </DialogTitle>
            <DialogDescription>为智能体选择内置技能，已选择 {selectedSkills.length} 个。</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={skillQuery}
              onChange={(e) => setSkillQuery(e.target.value)}
              placeholder="搜索技能名称或标签，如「数据」「分析」…"
              className="pl-9"
            />
          </div>
          <div className="max-h-[60vh] min-h-[340px] space-y-2 overflow-y-auto pr-1">
            {filteredSkillGroups.length === 0 ? (
              <div className="flex h-full items-center justify-center py-12 text-sm text-muted-foreground">
                未找到匹配「{skillQuery}」的技能
              </div>
            ) : (
              filteredSkillGroups.map((group) => {
                const open = openSkillGroups.includes(group.category) || skillQuery.trim() !== ""
                return (
                  <div key={group.category} className="overflow-hidden rounded-lg border border-border">
                    <button
                      onClick={() => toggleSkillGroup(group.category)}
                      className="flex w-full items-center gap-2 bg-secondary/50 px-3 py-2.5 text-sm font-medium text-foreground"
                    >
                      <ChevronRight className={cn("size-4 transition-transform", open && "rotate-90")} />
                      {group.category}
                      <span className="text-xs text-muted-foreground">（{group.skills.length}）</span>
                    </button>
                    {open && (
                      <ul className="divide-y divide-border">
                        {group.skills.map((skill) => {
                          const selected = selectedSkills.includes(skill.name)
                          return (
                            <li key={skill.name}>
                              <button
                                onClick={() => onToggleSkill(skill.name)}
                                className="flex w-full items-center justify-between gap-3 px-3 py-2 pl-9 text-left text-sm hover:bg-accent/50"
                              >
                                <div className="flex-1">
                                  <span className="text-foreground">{skill.name}</span>
                                  <p className="text-xs text-muted-foreground">{skill.description}</p>
                                  <div className="mt-1 flex flex-wrap gap-1.5">
                                    {skill.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <span
                                  className={cn(
                                    "flex size-4 shrink-0 items-center justify-center rounded border",
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
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
