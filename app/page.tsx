"use client"

import { useEffect, useState } from "react"
import { PanelRight, ArrowLeft } from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { ConversationSidebar } from "@/components/chat/conversation-sidebar"
import { WelcomeScreen } from "@/components/chat/welcome-screen"
import { ChatThread } from "@/components/chat/chat-thread"
import { ChatComposer } from "@/components/chat/chat-composer"
import { TaskPanel } from "@/components/chat/task-panel"
import { useChat } from "@/hooks/use-chat"
import { getAgent } from "@/lib/mock-data"
import type { AgentId } from "@/lib/types"

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

  const selectedAgent = getAgent(activeConversation?.agentId)
  const hasMessages = (activeConversation?.messages.length ?? 0) > 0
  const hasPlan = !!activeConversation?.plan && (activeConversation.plan.steps.length ?? 0) > 0

  // Find the last used agent from the most recent conversation with messages
  const lastUsedAgentId = conversations
    .filter((c) => c.messages.length > 0 && c.agentId)
    .sort((a, b) => b.updatedAt - a.updatedAt)[0]?.agentId ?? null

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

  const showPanel = hasPlan && panelOpen

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
            <h2 className="mx-auto truncate text-sm font-semibold text-foreground">
              {activeConversation?.title ?? "新对话"}
            </h2>
            {hasPlan && !panelOpen && (
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
      </div>
    </TooltipProvider>
  )
}
