"use client"

import { useState, useMemo } from "react"
import { Sparkles, Search, ChevronLeft, ChevronRight, History } from "lucide-react"
import { AGENTS } from "@/lib/mock-data"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Agent, AgentId } from "@/lib/types"

const ITEMS_PER_PAGE = 8

export function WelcomeScreen({
  agent,
  onSelectAgent,
  onPickQuestion,
  lastUsedAgentId,
}: {
  agent: Agent | undefined
  onSelectAgent: (id: AgentId) => void
  onPickQuestion: (q: string) => void
  /** The ID of the last used agent (from the most recent conversation) */
  lastUsedAgentId?: AgentId | null
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // Find the last used agent
  const lastUsedAgent = useMemo(() => {
    if (!lastUsedAgentId) return null
    return AGENTS.find((a) => a.id === lastUsedAgentId) ?? null
  }, [lastUsedAgentId])

  // Filter and sort agents by updatedAt (most recent first)
  const filteredAgents = useMemo(() => {
    let result = [...AGENTS]

    // Exclude the last used agent from the main list (it will be shown separately)
    if (lastUsedAgentId) {
      result = result.filter((a) => a.id !== lastUsedAgentId)
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.tagline.toLowerCase().includes(query) ||
          a.description.toLowerCase().includes(query) ||
          a.skills.some((s) => s.name.toLowerCase().includes(query))
      )
    }

    // Sort by updatedAt (most recent first)
    result.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))

    return result
  }, [searchQuery, lastUsedAgentId])

  // Pagination
  const totalPages = Math.ceil(filteredAgents.length / ITEMS_PER_PAGE)
  const paginatedAgents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredAgents.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredAgents, currentPage])

  // Reset page when filter changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  // No agent selected yet — show the picker grid
  if (!agent) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 py-8">
        <div className="text-center">
          <h1 className="text-balance text-2xl font-bold text-foreground md:text-3xl">
            选择一个智能体开始对话
          </h1>
          <p className="mt-2 text-pretty text-sm text-muted-foreground">
            每个智能体擅长不同的任务，选择合适的智能体可以获得更好的回答。
          </p>
        </div>

        {/* Search */}
        <div className="w-full sm:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="搜索智能体..."
              className="pl-9"
            />
          </div>
        </div>

        {/* Last Used Agent Card */}
        {lastUsedAgent && !searchQuery && (
          <div className="w-full">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <History className="size-3.5" />
              上次使用
            </div>
            <button
              type="button"
              onClick={() => onSelectAgent(lastUsedAgent.id)}
              className="flex w-full items-start gap-3 rounded-2xl border-2 border-primary/30 bg-primary/5 p-4 text-left transition-colors hover:border-primary/50 hover:bg-primary/10"
            >
              <img
                src={lastUsedAgent.avatar || "/placeholder.svg"}
                alt=""
                className="size-11 shrink-0 rounded-full object-cover ring-2 ring-primary/20"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold text-foreground">{lastUsedAgent.name}</p>
                  <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                    继续对话
                  </span>
                </div>
                <p className="text-xs text-primary">{lastUsedAgent.tagline}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {lastUsedAgent.description}
                </p>
              </div>
            </button>
          </div>
        )}

        {/* Agent Grid */}
        {paginatedAgents.length > 0 ? (
          <div className="w-full">
            {lastUsedAgent && !searchQuery && (
              <div className="mb-2 text-xs font-medium text-muted-foreground">
                全部智能体
              </div>
            )}
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
              {paginatedAgents.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => onSelectAgent(a.id)}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-accent/50"
                >
                  <img
                    src={a.avatar || "/placeholder.svg"}
                    alt=""
                    className="size-11 shrink-0 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">{a.name}</p>
                    <p className="text-xs text-primary">{a.tagline}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {a.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="mb-3 size-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              未找到匹配的智能体
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              尝试使用其他关键词搜索
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show limited page numbers for better UX
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="icon"
                      className="size-8 text-xs"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  )
                }
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <span key={page} className="px-1 text-muted-foreground">
                      ...
                    </span>
                  )
                }
                return null
              })}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}

        {/* Total count */}
        <p className="text-xs text-muted-foreground">
          共 {filteredAgents.length + (lastUsedAgent && !searchQuery ? 1 : 0)} 个智能体
          {totalPages > 1 && `，第 ${currentPage}/${totalPages} 页`}
        </p>
      </div>
    )
  }

  // Agent selected — show greeting + sample questions
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 px-4 py-10">
      <img
        src={agent.avatar || "/placeholder.svg"}
        alt=""
        className="size-16 rounded-full object-cover ring-4 ring-primary/10"
      />
      <div className="text-center">
        <h1 className="text-balance text-2xl font-bold text-foreground md:text-3xl">
          你好，我是{agent.name}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
          {agent.greeting}
        </p>
      </div>
      <div className="w-full">
        <p className="mb-2 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          试试这些问题
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {agent.sampleQuestions.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onPickQuestion(q)}
              className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-accent/50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
