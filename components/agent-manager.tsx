"use client"

import { useState } from "react"
import type { Agent } from "@/lib/types"
import { SAMPLE_AGENTS, createEmptyAgent, normalizeImportedAgent } from "@/lib/sample-agents"
import { AgentList } from "@/components/agent-list"
import { AgentEditor } from "@/components/agent-editor"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

export function AgentManager() {
  const [agents, setAgents] = useState<Agent[]>(SAMPLE_AGENTS)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast } = useToast()

  const editingAgent = agents.find((a) => a.id === editingId) ?? null

  const handleCreate = () => {
    const fresh = createEmptyAgent()
    setAgents((prev) => [fresh, ...prev])
    setEditingId(fresh.id)
  }

  const handleEdit = (agent: Agent) => setEditingId(agent.id)

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
    setEditingId(null) // 发布后自动回到管理页
  }

  return (
    <>
      {editingAgent ? (
        <AgentEditor
          key={editingAgent.id}
          agent={editingAgent}
          onBack={() => setEditingId(null)}
          onSave={handleSave}
          onPublish={handlePublish}
        />
      ) : (
        <AgentList
          agents={agents}
          onEdit={handleEdit}
          onCreate={handleCreate}
          onDelete={handleDelete}
          onImport={handleImport}
        />
      )}
      <Toaster />
    </>
  )
}
