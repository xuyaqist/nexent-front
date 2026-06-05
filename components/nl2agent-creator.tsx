"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Bot, Send, User, Sparkles, Loader2, Check, RefreshCw, Wrench, ChevronRight } from "lucide-react"
import type { Agent } from "@/lib/types"
import { createEmptyAgent } from "@/lib/sample-agents"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  suggestedTools?: string[]
  generatedPrompt?: string
}

interface NL2AgentCreatorProps {
  onBack: () => void
  onComplete: (agent: Agent) => void
}

// 模拟 AI 响应的追问和生成逻辑
function generateAIResponse(messages: Message[], userInput: string): { content: string; suggestedTools?: string[]; generatedPrompt?: string } {
  const messageCount = messages.filter(m => m.role === "user").length + 1
  
  // 第一轮：询问基本信息
  if (messageCount === 1) {
    return {
      content: `好的，我来帮你创建智能体。首先让我了解一下：

1. **这个智能体的主要用途是什么？** 比如：数据分析、文档处理、客户服务等
2. **目标用户是谁？** 比如：运营人员、开发人员、销售团队等
3. **你希望它具备哪些核心能力？**

请尽可能详细地描述你的需求。`
    }
  }
  
  // 第二轮：根据回答推荐工具
  if (messageCount === 2) {
    const input = userInput.toLowerCase()
    const suggestedTools: string[] = []
    
    if (input.includes("数据") || input.includes("分析") || input.includes("统计")) {
      suggestedTools.push("query", "insert", "update")
    }
    if (input.includes("文档") || input.includes("word") || input.includes("excel") || input.includes("报告")) {
      suggestedTools.push("create_docx", "read_docx", "edit_docx")
    }
    if (input.includes("邮件") || input.includes("通知")) {
      suggestedTools.push("send_email", "read_inbox")
    }
    if (input.includes("搜索") || input.includes("查询") || input.includes("检索")) {
      suggestedTools.push("web_search", "doc_search")
    }
    if (input.includes("图片") || input.includes("图像") || input.includes("识别")) {
      suggestedTools.push("image_understand", "ocr")
    }
    if (input.includes("文件") || input.includes("读取") || input.includes("写入")) {
      suggestedTools.push("read_file", "write_file", "list_dir")
    }
    
    if (suggestedTools.length === 0) {
      suggestedTools.push("query", "web_search", "create_docx")
    }
    
    return {
      content: `根据你的描述，我为你推荐了以下工具能力：

${suggestedTools.map(t => `- **${t}**`).join('\n')}

这些工具能帮助智能体完成相关任务。你可以：
- 确认使用这些工具
- 告诉我需要增减哪些工具
- 描述更多细节让我优化推荐

你还有什么补充的需求吗？比如智能体的回复风格、特殊处理逻辑等。`,
      suggestedTools
    }
  }
  
  // 第三轮：生成提示词
  return {
    content: `太好了！根据我们的对话，我已经为你生成了智能体的提示词。请查看下方的预览，你可以：

- 直接确认并创建智能体
- 告诉我哪里需要修改，我会帮你优化

如果满意的话，点击"确认创建"按钮即可完成智能体创建。`,
    suggestedTools: messages.find(m => m.suggestedTools)?.suggestedTools || ["query", "web_search"],
    generatedPrompt: `你是一个专业的智能助手，具备以下特点：

## 角色定位
根据用户需求提供高效、准确的服务支持。

## 核心能力
- 理解用户意图并提供精准回答
- 调用相关工具完成复杂任务
- 保持友好专业的沟通风格

## 工作流程
1. 分析用户需求
2. 选择合适的工具执行任务
3. 整理结果并清晰呈现
4. 主动询问是否需要进一步帮助

## 注意事项
- 始终确认关键信息后再执行操作
- 遇到不确定的情况主动向用户澄清
- 保护用户数据安全和隐私`
  }
}

export function NL2AgentCreator({ onBack, onComplete }: NL2AgentCreatorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `你好！我是智能体创建助手。

通过自然语言对话，我可以帮你快速创建一个智能体。我会：
- 主动追问以澄清你的需求
- 智能匹配合适的工具和技能
- 生成优化的提示词

现在，请告诉我你想创建什么样的智能体？`
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentTools, setCurrentTools] = useState<string[]>([])
  const [currentPrompt, setCurrentPrompt] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])
  
  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: "user",
      content: input.trim()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    
    // 模拟 AI 思考延迟
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))
    
    const response = generateAIResponse(messages, userMessage.content)
    
    const assistantMessage: Message = {
      id: `assistant_${Date.now()}`,
      role: "assistant",
      content: response.content,
      suggestedTools: response.suggestedTools,
      generatedPrompt: response.generatedPrompt
    }
    
    setMessages(prev => [...prev, assistantMessage])
    
    if (response.suggestedTools) {
      setCurrentTools(response.suggestedTools)
    }
    if (response.generatedPrompt) {
      setCurrentPrompt(response.generatedPrompt)
    }
    
    setIsLoading(false)
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }
  
  const handleConfirmCreate = () => {
    const agent = createEmptyAgent()
    agent.name = "NL2Agent 生成的智能体"
    agent.description = "通过自然语言对话生成的智能体"
    agent.tools = currentTools
    agent.role = currentPrompt
    agent.businessLogic = messages.filter(m => m.role === "user").map(m => m.content).join("\n")
    onComplete(agent)
  }
  
  const handleRegeneratePrompt = () => {
    setIsLoading(true)
    setTimeout(() => {
      setCurrentPrompt(prev => prev + "\n\n## 补充说明\n- 保持响应简洁明了\n- 在复杂任务中分步骤执行")
      setIsLoading(false)
    }, 1000)
  }
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* 顶部栏 */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} aria-label="返回">
              <ArrowLeft className="size-5" />
            </Button>
            <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">NL2Agent 创建助手</h1>
              <p className="text-sm text-muted-foreground">通过对话创建智能体</p>
            </div>
          </div>
        </div>
      </header>
      
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-6">
        <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-5">
          {/* 对话区域 */}
          <div className="flex flex-col lg:col-span-3">
            <div className="flex-1 overflow-y-auto pr-4">
              <div className="space-y-4 pb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent text-accent-foreground"
                      }`}
                    >
                      {message.role === "user" ? <User className="size-4" /> : <Bot className="size-4" />}
                    </div>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border border-border"
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                      {message.suggestedTools && message.suggestedTools.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {message.suggestedTools.map((tool) => (
                            <Badge key={tool} variant="secondary" className="text-xs">
                              <Wrench className="mr-1 size-3" />
                              {tool}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
                      <Bot className="size-4" />
                    </div>
                    <div className="rounded-2xl border border-border bg-card px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        正在思考...
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {/* 输入区域 */}
            <div className="mt-4 rounded-xl border border-border bg-card p-3">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="描述你想创建的智能体..."
                className="min-h-[80px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0"
                disabled={isLoading}
              />
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">按 Enter 发送，Shift + Enter 换行</p>
                <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="sm" className="gap-1.5">
                  <Send className="size-4" />
                  发送
                </Button>
              </div>
            </div>
          </div>
          
          {/* 预览面板 */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            {/* 工具预览 */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                <Wrench className="size-4" />
                推荐工具
              </h3>
              {currentTools.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {currentTools.map((tool) => (
                    <Badge key={tool} variant="outline" className="text-xs">
                      {tool}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">工具将在对话中自动推荐</p>
              )}
            </div>
            
            {/* 提示词预览 */}
            <div className="flex flex-1 flex-col rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Sparkles className="size-4" />
                  生成的提示词
                </h3>
                {currentPrompt && (
                  <Button variant="ghost" size="sm" onClick={handleRegeneratePrompt} disabled={isLoading}>
                    <RefreshCw className="size-3.5" />
                  </Button>
                )}
              </div>
              {currentPrompt ? (
                <div className="flex-1 overflow-y-auto">
                  {isEditing ? (
                    <Textarea
                      value={currentPrompt}
                      onChange={(e) => setCurrentPrompt(e.target.value)}
                      className="min-h-[200px] resize-none text-sm"
                    />
                  ) : (
                    <div 
                      className="cursor-pointer whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground transition-colors hover:bg-muted"
                      onClick={() => setIsEditing(true)}
                    >
                      {currentPrompt}
                      <p className="mt-2 text-xs text-primary">点击编辑提示词</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-center">
                  <p className="text-center text-sm text-muted-foreground">
                    提示词将在对话完成后生成
                  </p>
                </div>
              )}
            </div>
            
            {/* 创建按钮 */}
            {currentPrompt && (
              <Button onClick={handleConfirmCreate} className="gap-2">
                <Check className="size-4" />
                确认创建智能体
                <ChevronRight className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
