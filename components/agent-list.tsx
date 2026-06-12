"use client"

import { Bot, Plus, Search, MoreVertical, Pencil, GitBranch, Clock, Upload, TrendingUp } from "lucide-react"
import { useRef, useState } from "react"
import type { Agent } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

interface AgentListProps {
  agents: Agent[]
  onEdit: (agent: Agent) => void
  onCreate: () => void
  onDelete: (id: string) => void
  onImport: (file: File) => void
  onEvaluate: (agent: Agent) => void
}

export function AgentList({ agents, onEdit, onCreate, onDelete, onImport, onEvaluate }: AgentListProps) {
  const [query, setQuery] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onImport(file)
    e.target.value = "" // 允许重复导入同一文件
  }

  const filtered = agents.filter(
    (a) => a.name.toLowerCase().includes(query.toLowerCase()) || a.description.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      {/* 页头 */}
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">智能体管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">管理你创建的智能体，点击卡片即可编辑配置。</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索智能体"
              className="w-56 pl-9"
            />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-1.5">
            <Upload className="size-4" />
            导入
          </Button>
          <Button onClick={onCreate} className="gap-1.5">
            <Plus className="size-4" />
            新建智能体
          </Button>
        </div>
      </header>

      {/* 卡片网格 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* 新建卡片 */}
        <button
          onClick={onCreate}
          className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-card/50 text-muted-foreground transition-colors hover:border-primary hover:bg-accent hover:text-primary"
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-accent">
            <Plus className="size-6" />
          </div>
          <span className="text-sm font-medium">创建新的智能体</span>
        </button>

        {filtered.map((agent) => (
          <AgentCard key={agent.id} agent={agent} onEdit={onEdit} onDelete={onDelete} onEvaluate={onEvaluate} />
        ))}
      </div>

      {filtered.length === 0 && query && (
        <p className="mt-10 text-center text-sm text-muted-foreground">没有找到匹配的智能体。</p>
      )}
    </div>
  )
}

function AgentCard({
  agent,
  onEdit,
  onDelete,
  onEvaluate,
}: {
  agent: Agent
  onEdit: (agent: Agent) => void
  onDelete: (id: string) => void
  onEvaluate: (agent: Agent) => void
}) {
  return (
    <div
      onClick={() => onEdit(agent)}
      className="group flex min-h-[180px] cursor-pointer flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-lg bg-accent text-primary">
            <Bot className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-foreground">{agent.name}</h3>
              <span className="rounded border border-border bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                {agent.version}
              </span>
            </div>
            <span
              className={
                "mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium " +
                (agent.status === "published"
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-amber-50 text-amber-600")
              }
            >
              {agent.status === "published" ? "已发布" : "草稿"}
            </span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={() => onEdit(agent)}>
              <Pencil className="size-4" />
              编辑
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEvaluate(agent)}>
              <TrendingUp className="size-4" />
              评估
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(agent.id)}
            >
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">{agent.description || "暂无描述"}</p>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <GitBranch className="size-3.5" />
          {agent.versionCount} 个版本
        </span>
        <span className="flex items-center gap-1">
          <Clock className="size-3.5" />
          {formatDate(agent.updatedAt)}
        </span>
      </div>

      <div className="mt-3 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5"
          onClick={(e) => {
            e.stopPropagation()
            onEdit(agent)
          }}
        >
          <Pencil className="size-4" />
          编辑
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5"
          onClick={(e) => {
            e.stopPropagation()
            onEvaluate(agent)
          }}
        >
          <TrendingUp className="size-4" />
          评估
        </Button>
      </div>
    </div>
  )
}
