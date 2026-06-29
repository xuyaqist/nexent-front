"use client"

import { useMemo, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { ConversationSidebar } from "@/components/chat/conversation-sidebar"
import { WelcomeScreen } from "@/components/chat/welcome-screen"
import { ChatThread, SourcesSidebar } from "@/components/chat/chat-thread"
import { ChatComposer } from "@/components/chat/chat-composer"
import { TaskPanelInline } from "@/components/chat/task-panel-inline"
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
  const [chatMode, setChatMode] = useState<ChatMode>("planning")
  const [sourcesOpen, setSourcesOpen] = useState(false)
  const [activeSourceId, setActiveSourceId] = useState<number | null>(null)

  const selectedAgent = getAgent(activeConversation?.agentId)
  const sources = activeConversation?.sources ?? []

  function handleOpenSources(id: number | null) {
    setActiveSourceId(id)
    setSourcesOpen(true)
  }
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

    // If we have real usage data, return it
    if (totalPrompt > 0 || totalCompletion > 0) {
      return {
        prompt: totalPrompt,
        completion: totalCompletion,
        total: totalPrompt + totalCompletion,
      }
    }

    // Mock data for demo purposes - always show when agent is selected
    return {
      prompt: 2450,
      completion: 1230,
      total: 3680,
    }
  }, [activeConversation])

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

  const showInlinePanel = chatMode === "planning" && hasPlan

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
                  onOpenSources={handleOpenSources}
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
                  {showInlinePanel && activeConversation && (
                    <TaskPanelInline conversation={activeConversation} />
                  )}
                  <ChatComposer
                    selectedAgent={selectedAgent}
                    onSelectAgent={handleSelectAgent}
                    onSend={handleSend}
                    isStreaming={isStreaming}
                    onStop={stop}
                    chatMode={chatMode}
                    onModeChange={setChatMode}
                    tokenUsage={tokenUsage}
                  />
                  <p className="mt-2 text-center text-xs text-muted-foreground">内容由 AI 生成，请仔细甄别</p>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* sources panel — sits beside the conversation instead of covering it */}
        {sources.length > 0 && (
          <SourcesSidebar
            sources={sources}
            open={sourcesOpen}
            onClose={() => setSourcesOpen(false)}
            activeId={activeSourceId}
          />
        )}
      </div>
    </TooltipProvider>
  )
}
