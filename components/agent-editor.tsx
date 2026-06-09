"use client"

import { useState } from "react"
import { ArrowLeft, Bot, GitBranch, Sparkles, Settings2, Play, Save, Send, Plus, X, MessageSquare } from "lucide-react"
import type { Agent } from "@/lib/types"
import { MODELS, PROMPT_TEMPLATES } from "@/lib/types"
import { AgentCapabilityPanel } from "@/components/agent-capability-panel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AgentEditorProps {
  agent: Agent
  onBack: () => void
  onSave: (agent: Agent) => void
  onPublish: (agent: Agent) => void
}

export function AgentEditor({ agent, onBack, onSave, onPublish }: AgentEditorProps) {
  const [draft, setDraft] = useState<Agent>(agent)

  const update = <K extends keyof Agent>(key: K, value: Agent[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }))

  const toggleTool = (tool: string) =>
    setDraft((prev) => ({
      ...prev,
      tools: prev.tools.includes(tool) ? prev.tools.filter((t) => t !== tool) : [...prev.tools, tool],
    }))

  const toggleSkill = (skill: string) =>
    setDraft((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill) ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill],
    }))

  const updateExampleQuestion = (index: number, value: string) =>
    setDraft((prev) => ({
      ...prev,
      exampleQuestions: prev.exampleQuestions.map((q, i) => (i === index ? value : q)),
    }))

  const addExampleQuestion = () =>
    setDraft((prev) => ({ ...prev, exampleQuestions: [...prev.exampleQuestions, ""] }))

  const removeExampleQuestion = (index: number) =>
    setDraft((prev) => ({
      ...prev,
      exampleQuestions: prev.exampleQuestions.filter((_, i) => i !== index),
    }))

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部栏 */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} aria-label="返回管理页" className="shrink-0">
              <ArrowLeft className="size-5" />
            </Button>
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
              <Bot className="size-6" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-semibold text-foreground">{draft.name || "未命名智能体"}</h1>
              <p className="truncate text-sm text-muted-foreground">{draft.description || "暂无描述"}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <GitBranch className="size-4" />
              版本管理
            </Button>
          </div>
        </div>
      </header>

      {/* 主体 */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-8 lg:grid-cols-2">
        {/* 左：配置能力 */}
        <AgentCapabilityPanel 
          selectedTools={draft.tools} 
          selectedSkills={draft.skills}
          onToggleTool={toggleTool} 
          onToggleSkill={toggleSkill}
        />

        {/* 右：业务逻辑 */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              2
            </span>
            <h2 className="text-base font-semibold text-foreground">描述业务逻辑</h2>
          </div>

          <Label className="mb-2 block text-sm font-medium">描述智能体应该如何工作</Label>
          <Textarea
            value={draft.businessLogic}
            onChange={(e) => update("businessLogic", e.target.value)}
            placeholder="请描述这个智能体的工作方式…"
            className="min-h-24 resize-none"
          />

          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <Label className="w-20 shrink-0 text-sm text-muted-foreground">提示词模板：</Label>
              <Select value={draft.promptTemplate} onValueChange={(v) => update("promptTemplate", v)}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROMPT_TEMPLATES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="default" size="sm" className="gap-1.5">
                <Settings2 className="size-4" />
                管理模板
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Label className="w-20 shrink-0 text-sm text-muted-foreground">大语言模型：</Label>
              <Select value={draft.model} onValueChange={(v) => update("model", v)}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODELS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="default" size="sm" className="gap-1.5">
                <Sparkles className="size-4" />
                生成智能体
              </Button>
            </div>
          </div>

          {/* 详细内容 */}
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-medium text-foreground">智能体详细内容</h3>
            <Tabs defaultValue="info">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="info">智能体信息</TabsTrigger>
                <TabsTrigger value="role">智能体角色</TabsTrigger>
                <TabsTrigger value="req">使用要求</TabsTrigger>
                <TabsTrigger value="example">示例</TabsTrigger>
                <TabsTrigger value="conversation">对话设置</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-4 space-y-4">
                <Field label="智能体名称" required>
                  <Input value={draft.name} onChange={(e) => update("name", e.target.value)} />
                </Field>
                <Field label="智能体变量名" required>
                  <Input value={draft.variableName} onChange={(e) => update("variableName", e.target.value)} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="作者" required>
                    <Input value={draft.author} onChange={(e) => update("author", e.target.value)} />
                  </Field>
                  <Field label="大语言模型" required>
                    <Select value={draft.model} onValueChange={(v) => update("model", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MODELS.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="智能体运行最大步骤数" required>
                    <Input
                      type="number"
                      value={draft.maxSteps}
                      onChange={(e) => update("maxSteps", Number(e.target.value))}
                    />
                  </Field>
                  <Field label="提供运行摘要" required>
                    <Select value={draft.runSummary} onValueChange={(v) => update("runSummary", v as "是" | "否")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="是">是</SelectItem>
                        <SelectItem value="否">否</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field label="智能体描述">
                  <Textarea
                    value={draft.description}
                    onChange={(e) => update("description", e.target.value)}
                    className="min-h-28 resize-none"
                  />
                </Field>
              </TabsContent>

              <TabsContent value="role" className="mt-4">
                <Field label="智能体角色">
                  <Textarea
                    value={draft.role}
                    onChange={(e) => update("role", e.target.value)}
                    placeholder="描述智能体扮演的角色…"
                    className="min-h-44 resize-none"
                  />
                </Field>
              </TabsContent>

              <TabsContent value="req" className="mt-4">
                <Field label="使用要求">
                  <Textarea
                    value={draft.requirements}
                    onChange={(e) => update("requirements", e.target.value)}
                    placeholder="描述使用该智能体的前置要求…"
                    className="min-h-44 resize-none"
                  />
                </Field>
              </TabsContent>

              <TabsContent value="example" className="mt-4">
                <Field label="示例">
                  <Textarea
                    value={draft.examples}
                    onChange={(e) => update("examples", e.target.value)}
                    placeholder="提供使用示例…"
                    className="min-h-44 resize-none"
                  />
                </Field>
              </TabsContent>

              <TabsContent value="conversation" className="mt-4 space-y-5">
                <Field label="开场白">
                  <Textarea
                    value={draft.openingMessage}
                    onChange={(e) => update("openingMessage", e.target.value)}
                    placeholder="设置智能体在对话开始时主动发送的问候语…"
                    className="min-h-24 resize-none"
                  />
                  <p className="text-xs text-muted-foreground">用户开启对话时，智能体会首先发送这段开场白。</p>
                </Field>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">示例问题</Label>
                    <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={addExampleQuestion}>
                      <Plus className="size-3.5" />
                      添加问题
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    示例问题会展示在对话界面，帮助用户快速了解智能体的能力。
                  </p>

                  {draft.exampleQuestions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-8 text-center">
                      <MessageSquare className="size-6 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">暂无示例问题，点击「添加问题」创建</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {draft.exampleQuestions.map((q, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-medium text-primary">
                            {i + 1}
                          </span>
                          <Input
                            value={q}
                            onChange={(e) => updateExampleQuestion(i, e.target.value)}
                            placeholder={`示例问题 ${i + 1}`}
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => removeExampleQuestion(i)}
                            aria-label="删除问题"
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* 操作按钮 */}
          <div className="mt-6 flex items-center justify-center gap-3 border-t border-border pt-5">
            <Button variant="default" className="gap-1.5">
              <Play className="size-4" />
              调试
            </Button>
            <Button
              onClick={() => onSave(draft)}
              className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Save className="size-4" />
              保存
            </Button>
            <Button onClick={() => onPublish(draft)} className="gap-1.5">
              <Send className="size-4" />
              发布
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">
        {required && <span className="mr-0.5 text-destructive">*</span>}
        {label}
      </Label>
      {children}
    </div>
  )
}
