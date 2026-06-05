"use client"

import { useEffect, useMemo, useState } from "react"
import { PanelRight, ArrowLeft, Lightbulb, Play } from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { ConversationSidebar } from "@/components/chat/conversation-sidebar"
import { WelcomeScreen } from "@/components/chat/welcome-screen"
import { ChatThread } from "@/components/chat/chat-thread"
import { ChatComposer } from "@/components/chat/chat-composer"
import { TaskPanel } from "@/components/chat/task-panel"
import { TokenUsageWidget } from "@/components/chat/token-usage-widget"
import { useChat } from "@/hooks/use-chat"
import { getAgent } from "@/lib/mock-data"
import type { AgentId } from "@/lib/types"

type ChatMode = "planning" | "execution"

export default function Page() {
  const {
    conversations,
    activeConversation,
    activeId,
    isStreaming,
    newConversation,
    selectConversation,
    setActiveAgent,
    sendMessage,
    resolveHitl,
    stop,
  } = useChat()

  const [collapsed, setCollapsed] = useState(false)
  const [panelOpen, setPanelOpen] = useState(true)
  const [chatMode, setChatMode] = useState<ChatMode>("planning")

  const selectedAgent = getAgent(activeConversation?.agentId)
  const hasMessages = (activeConversation?.messages.length ?? 0) > 0
  const hasPlan = !!activeConversation?.plan && (activeConversation.plan.steps.length ?? 0) > 0

  // Find the last used agent from the most recent conversation with messages
  const lastUsedAgentId = conversations
    .filter((c) => c.messages.length > 0 && c.agentId)
    .sort((a, b) => b.updatedAt - a.updatedAt)[0]?.agentId ?? null

  // Calculate cumulative token usage from all assistant messages
  const tokenUsage = useMemo(() => {
    if (!activeConversation) return null
    const messages = activeConversation.messages
    let totalPrompt = 0
    let totalCompletion = 0

    for (const msg of messages) {
      if (msg.role === "assistant" && msg.usage) {
        totalPrompt += msg.usage.prompt
        totalCompletion += msg.usage.completion
      }
    }

    // Mock data for demo purposes when no real usage exists
    if (totalPrompt === 0 && totalCompletion === 0 && messages.length > 0) {
      return {
        prompt: 2450,
        completion: 1230,
        total: 3680,
      }
    }

    if (totalPrompt === 0 && totalCompletion === 0) {
      return null
    }

    return {
      prompt: totalPrompt,
      completion: totalCompletion,
      total: totalPrompt + totalCompletion,
    }
  }, [activeConversation])

  // auto-open the task panel whenever a plan appears
  useEffect(() => {
    if (hasPlan) setPanelOpen(true)
  }, [hasPlan])

  function handleBack() {
    setActiveAgent(null)
  }

  function handleSend(text: string) {
    if (!selectedAgent) return
    sendMessage(text, selectedAgent.id)
  }

  function handleSelectAgent(id: AgentId) {
    setActiveAgent(id)
  }

  const showPanel = chatMode === "planning" && hasPlan && panelOpen
  const showFloatingToken = chatMode === "execution" && hasMessages && tokenUsage

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-screen overflow-hidden bg-background">
        <ConversationSidebar
          conversations={conversations}
          activeId={activeId}
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          onSelect={selectConversation}
          onNew={newConversation}
        />

        <main className="flex min-w-0 flex-1 flex-col">
          {/* header */}
          <header className="relative flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
            {selectedAgent && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 text-muted-foreground"
                onClick={handleBack}
                aria-label="返回选择智能体"
              >
                <ArrowLeft className="size-5" />
              </Button>
            )}

            {/* Mode switcher - centered with title */}
            <div className="mx-auto flex items-center gap-3">
              <h2 className="truncate text-sm font-semibold text-foreground">
                {activeConversation?.title ?? "新对话"}
              </h2>
              {selectedAgent && (
                <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5">
                  <Button
                    variant={chatMode === "planning" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 gap-1.5 rounded-md px-2.5 text-xs"
                    onClick={() => setChatMode("planning")}
                  >
                    <Lightbulb className="size-3.5" />
                    规划模式
                  </Button>
                  <Button
                    variant={chatMode === "execution" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 gap-1.5 rounded-md px-2.5 text-xs"
                    onClick={() => setChatMode("execution")}
                  >
                    <Play className="size-3.5" />
                    执行模式
                  </Button>
                </div>
              )}
            </div>

            {chatMode === "planning" && hasPlan && !panelOpen && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 text-muted-foreground"
                onClick={() => setPanelOpen(true)}
                aria-label="打开任务面板"
              >
                <PanelRight className="size-5" />
              </Button>
            )}
          </header>

          {/* body */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              {hasMessages && activeConversation ? (
                <ChatThread
                  conversation={activeConversation}
                  isStreaming={isStreaming}
                  onResolveHitl={(msgId, approved) => resolveHitl(activeConversation.id, msgId, approved)}
                  onPickSuggestion={handleSend}
                />
              ) : (
                <WelcomeScreen
                  agent={selectedAgent}
                  onSelectAgent={handleSelectAgent}
                  onPickQuestion={handleSend}
                  lastUsedAgentId={lastUsedAgentId}
                />
              )}
            </div>

            {/* composer - only show when agent is selected */}
            {selectedAgent && (
              <div className="shrink-0 px-4 pb-4">
                <div className="mx-auto w-full max-w-3xl">
                  <ChatComposer
                    selectedAgent={selectedAgent}
                    onSelectAgent={handleSelectAgent}
                    onSend={handleSend}
                    isStreaming={isStreaming}
                    onStop={stop}
                  />
                  <p className="mt-2 text-center text-xs text-muted-foreground">内容由 AI 生成，请仔细甄别</p>
                </div>
              </div>
            )}
          </div>
        </main>

        {showPanel && activeConversation && (
          <TaskPanel conversation={activeConversation} onClose={() => setPanelOpen(false)} />
        )}

        {/* Floating Token Widget for execution mode */}
        {showFloatingToken && (
          <div className="fixed bottom-6 right-6 z-50">
            <TokenUsageWidget usage={tokenUsage} />
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
