"use client"

import { useState } from "react"
import type { Agent } from "@/lib/types"
import { SAMPLE_AGENTS, createEmptyAgent, normalizeImportedAgent } from "@/lib/sample-agents"
import { AgentList } from "@/components/agent-list"
import { AgentEditor } from "@/components/agent-editor"
import { AgentEvaluation } from "@/components/agent-evaluation"
import { NL2AgentCreator } from "@/components/nl2agent-creator"
import { CreateAgentDialog } from "@/components/create-agent-dialog"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

type ViewMode = "list" | "editor" | "nl2agent" | "evaluation"

export function AgentManager() {
  const [agents, setAgents] = useState<Agent[]>(SAMPLE_AGENTS)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const { toast } = useToast()

  const editingAgent = agents.find((a) => a.id === editingId) ?? null

  // 打开创建方式选择对话框
  const handleCreate = () => {
    setShowCreateDialog(true)
  }

  // 通过配置方式创建
  const handleConfigCreate = () => {
    const fresh = createEmptyAgent()
    setAgents((prev) => [fresh, ...prev])
    setEditingId(fresh.id)
    setViewMode("editor")
  }

  // 通过 NL2Agent 方式创建
  const handleNL2AgentCreate = () => {
    setViewMode("nl2agent")
  }

  // NL2Agent 创建完成
  const handleNL2AgentComplete = (agent: Agent) => {
    setAgents((prev) => [agent, ...prev])
    setEditingId(agent.id)
    setViewMode("editor")
    toast({
      title: "智能体已生成",
      description: `「${agent.name}」已通过 NL2Agent 创建，你可以继续编辑配置。`,
    })
  }

  const handleEdit = (agent: Agent) => {
    setEditingId(agent.id)
    setViewMode("editor")
  }

  const handleEvaluate = (agent: Agent) => {
    setEditingId(agent.id)
    setViewMode("evaluation")
  }

  const handleImport = async (file: File) => {
    try {
      const text = await file.text()
      const raw = JSON.parse(text)
      const list = Array.isArray(raw) ? raw : [raw]
      const imported = list.map((item) => normalizeImportedAgent(item))
      if (imported.length === 0) throw new Error("empty")
      setAgents((prev) => [...imported, ...prev])
      toast({
        title: "导入成功",
        description: `已导入 ${imported.length} 个智能体。`,
      })
    } catch {
      toast({
        title: "导入失败",
        description: "文件格式不正确，请选择有效的智能体 JSON 文件。",
        variant: "destructive",
      })
    }
  }

  const handleDelete = (id: string) => {
    setAgents((prev) => prev.filter((a) => a.id !== id))
    toast({ title: "已删除智能体" })
  }

  // 发布至 AgentHub（共享智能体广场）
  const handlePublishToHub = (agent: Agent) => {
    if (agent.publishedToHub) {
      toast({
        title: "已在 AgentHub 中",
        description: `「${agent.name}」此前已发布至 AgentHub。`,
      })
      return
    }
    setAgents((prev) =>
      prev.map((a) => (a.id === agent.id ? { ...a, publishedToHub: true } : a)),
    )
    toast({
      title: "已发布至 AgentHub",
      description: `「${agent.name}」已共享到 AgentHub，其他用户现在可以发现并使用它。`,
    })
  }

  const upsert = (updated: Agent, status?: Agent["status"]) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === updated.id
          ? { ...updated, status: status ?? updated.status, updatedAt: new Date().toISOString() }
          : a,
      ),
    )
  }

  const handleSave = (updated: Agent) => {
    upsert(updated)
    toast({ title: "已保存", description: `「${updated.name}」的修改已保存。` })
  }

  const handlePublish = (updated: Agent) => {
    upsert(updated, "published")
    toast({ title: "发布成功", description: `「${updated.name}」已发布。` })
    setEditingId(null)
    setViewMode("list")
  }

  const handleBackToList = () => {
    setEditingId(null)
    setViewMode("list")
  }

  // 根据视图模式渲染不同内容
  const renderContent = () => {
    switch (viewMode) {
      case "nl2agent":
        return (
          <NL2AgentCreator
            onBack={handleBackToList}
            onComplete={handleNL2AgentComplete}
          />
        )
      case "editor":
        return editingAgent ? (
          <AgentEditor
            key={editingAgent.id}
            agent={editingAgent}
            onBack={handleBackToList}
            onSave={handleSave}
            onPublish={handlePublish}
          />
        ) : null
      case "evaluation":
        return editingAgent ? (
          <AgentEvaluation key={editingAgent.id} agent={editingAgent} onBack={handleBackToList} />
        ) : null
      default:
        return (
          <AgentList
            agents={agents}
            onEdit={handleEdit}
            onCreate={handleCreate}
            onDelete={handleDelete}
            onImport={handleImport}
            onEvaluate={handleEvaluate}
            onPublishToHub={handlePublishToHub}
          />
        )
    }
  }

  return (
    <>
      {renderContent()}
      <CreateAgentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSelectConfig={handleConfigCreate}
        onSelectNL2Agent={handleNL2AgentCreate}
      />
      <Toaster />
    </>
  )
}
