"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Bot, Send, User, Sparkles, Loader2, Check, RefreshCw, Wrench, ChevronRight, Zap } from "lucide-react"
import type { Agent } from "@/lib/types"
import { createEmptyAgent } from "@/lib/sample-agents"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface GeneratedPrompt {
  role: string
  requirements: string
  examples: string
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  suggestedTools?: string[]
  suggestedSkills?: string[]
  generatedPrompt?: GeneratedPrompt
}

interface NL2AgentCreatorProps {
  onBack: () => void
  onComplete: (agent: Agent) => void
}

// 模拟 AI 响应的追问和生成逻辑
function generateAIResponse(
  messages: Message[], 
  userInput: string
): { 
  content: string
  suggestedTools?: string[]
  suggestedSkills?: string[]
  generatedPrompt?: GeneratedPrompt 
} {
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
  
  // 第二轮：根据回答推荐工具和技能
  if (messageCount === 2) {
    const input = userInput.toLowerCase()
    const suggestedTools: string[] = []
    const suggestedSkills: string[] = []
    
    // 推荐工具
    if (input.includes("数据") || input.includes("分析") || input.includes("统计")) {
      suggestedTools.push("query", "insert", "update")
      suggestedSkills.push("数据清洗", "数据聚合", "趋势分析")
    }
    if (input.includes("文档") || input.includes("word") || input.includes("excel") || input.includes("报告")) {
      suggestedTools.push("create_docx", "read_docx", "edit_docx")
      suggestedSkills.push("文档摘要", "格式转换", "模板填充")
    }
    if (input.includes("邮件") || input.includes("通知") || input.includes("沟通")) {
      suggestedTools.push("send_email", "read_inbox")
      suggestedSkills.push("邮件撰写", "会议纪要")
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
    if (input.includes("任务") || input.includes("项目") || input.includes("管理")) {
      suggestedSkills.push("任务分解", "决策建议")
    }
    if (input.includes("问题") || input.includes("原因") || input.includes("分析")) {
      suggestedSkills.push("根因分析", "决策建议")
    }
    
    // 默认推荐
    if (suggestedTools.length === 0) {
      suggestedTools.push("query", "web_search", "create_docx")
    }
    if (suggestedSkills.length === 0) {
      suggestedSkills.push("数据清洗", "文档摘要", "任务分解")
    }
    
    return {
      content: `根据你的描述，我为你推荐了以下能力配置：

**工具能力：**
${suggestedTools.map(t => `- ${t}`).join('\n')}

**技能：**
${suggestedSkills.map(s => `- ${s}`).join('\n')}

这些配置能帮助智能体完成相关任务。你可以：
- 确认使用这些配置
- 告诉我需要增减哪些工具或技能
- 描述更多细节让我优化推荐

你还有什么补充的需求吗？比如智能体的回复风格、特殊处理逻辑等。`,
      suggestedTools,
      suggestedSkills
    }
  }
  
  // 第三轮及之后：生成或优化提示词
  const existingPrompt = messages.find(m => m.generatedPrompt)?.generatedPrompt
  const prevTools = messages.find(m => m.suggestedTools)?.suggestedTools || ["query", "web_search"]
  const prevSkills = messages.find(m => m.suggestedSkills)?.suggestedSkills || ["数据清洗", "任务分解"]
  
  // 用户对已生成的提示词进行反馈修改
  if (existingPrompt) {
    const input = userInput.toLowerCase()
    let newRole = existingPrompt.role
    let newRequirements = existingPrompt.requirements
    let newExamples = existingPrompt.examples
    
    if (input.includes("角色") || input.includes("定位")) {
      newRole = existingPrompt.role + "\n- 根据用户反馈进行调整：" + userInput
    }
    if (input.includes("要求") || input.includes("规范") || input.includes("注意")) {
      newRequirements = existingPrompt.requirements + "\n- " + userInput
    }
    if (input.includes("示例") || input.includes("例子") || input.includes("比如")) {
      newExamples = existingPrompt.examples + "\n\n**补充示例：**\n" + userInput
    }
    
    // 通用修改
    if (newRole === existingPrompt.role && newRequirements === existingPrompt.requirements && newExamples === existingPrompt.examples) {
      newRequirements = existingPrompt.requirements + "\n- " + userInput
    }
    
    return {
      content: `好的，我已根据你的反馈优化了提示词。请查看右侧更新后的内容。

你还可以继续提出修改意见，或者点击"确认创建"完成智能体创建。`,
      suggestedTools: prevTools,
      suggestedSkills: prevSkills,
      generatedPrompt: {
        role: newRole,
        requirements: newRequirements,
        examples: newExamples
      }
    }
  }
  
  // 首次生成提示词
  const userMessages = messages.filter(m => m.role === "user").map(m => m.content).join(" ")
  
  let roleDesc = "专业的智能助手"
  let requirementsDesc = ""
  let examplesDesc = ""
  
  if (userMessages.includes("数据") || userMessages.includes("分析")) {
    roleDesc = "专业的数据分析师，擅长处理和分析各类数据，提供有价值的业务洞察"
    requirementsDesc = `- 分析前先确认数据源和分析目标
- 对数据进行清洗和预处理后再分析
- 结果以结构化方式呈现，包含图表说明
- 主动提供数据质量报告和分析建议`
    examplesDesc = `**用户：** 帮我分析上个月的销售数据
**助手：** 好的，我来帮你分析销售数据。首先请确认：
1. 数据来源是哪个数据库/表？
2. 需要关注哪些维度（时间、地区、产品等）？
3. 是否有特定的分析目标，如同比增长、趋势预测？`
  } else if (userMessages.includes("文档") || userMessages.includes("报告")) {
    roleDesc = "专业的文档处理专家，擅长创建、编辑和格式化各类办公文档"
    requirementsDesc = `- 创建文档前确认格式要求和模板
- 保持文档风格统一、格式规范
- 重要内容进行高亮标注
- 生成后提供预览和修改建议`
    examplesDesc = `**用户：** 帮我生成一份项目周报
**助手：** 好的，我来帮你生成周报。请提供以下信息：
1. 本周主要完成的工作内容
2. 遇到的问题和解决方案
3. 下周的工作计划
4. 是否需要使用特定的周报模板？`
  } else if (userMessages.includes("邮件") || userMessages.includes("沟通")) {
    roleDesc = "专业的商务沟通助手，擅长撰写各类商务邮件和沟通内容"
    requirementsDesc = `- 根据收件人和场景选择合适的语气
- 邮件结构清晰，重点突出
- 提供多个版本供用户选择
- 检查语法和格式后再发送`
    examplesDesc = `**用户：** 帮我写一封催款邮件
**助手：** 好的，我来帮你写催款邮件。请确认：
1. 收件人是什么关系（新客户/老客户）？
2. 逾期金额和时间是多少？
3. 希望的语气风格（温和提醒/正式催促）？
4. 是否需要设置付款截止日期？`
  } else {
    roleDesc = "通用智能助手，能够理解用户需求并提供高效、准确的服务支持"
    requirementsDesc = `- 主动理解并确认用户意图
- 选择最合适的工具完成任务
- 回复简洁明了、结构清晰
- 遇到不确定情况主动询问`
    examplesDesc = `**用户：** 帮我完成一个任务
**助手：** 好的，我很乐意帮助你。请告诉我：
1. 这个任务的具体内容是什么？
2. 有什么特殊要求或限制吗？
3. 期望的完成时间是？`
  }
  
  return {
    content: `太好了！根据我们的对话，我已经为你生成了智能体的提示词。

提示词分为三个部分：
- **角色**：定义智能体的身份和专业能力
- **使用要求**：规范智能体的行为和工作流程
- **示例**：展示典型的交互场景

请查看右侧的预览，你可以：
- 直接点击内容进行编辑
- 告诉我哪里需要修改，我会帮你优化
- 满意后点击"确认创建"按钮完成创建`,
    suggestedTools: prevTools,
    suggestedSkills: prevSkills,
    generatedPrompt: {
      role: roleDesc,
      requirements: requirementsDesc,
      examples: examplesDesc
    }
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
- 生成结构化的提示词（角色、使用要求、示例）

现在，请告诉我你想创建什么样的智能体？`
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentTools, setCurrentTools] = useState<string[]>([])
  const [currentSkills, setCurrentSkills] = useState<string[]>([])
  const [currentPrompt, setCurrentPrompt] = useState<GeneratedPrompt | null>(null)
  const [editingSection, setEditingSection] = useState<"role" | "requirements" | "examples" | null>(null)
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
      suggestedSkills: response.suggestedSkills,
      generatedPrompt: response.generatedPrompt
    }
    
    setMessages(prev => [...prev, assistantMessage])
    
    if (response.suggestedTools) {
      setCurrentTools(response.suggestedTools)
    }
    if (response.suggestedSkills) {
      setCurrentSkills(response.suggestedSkills)
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
    agent.skills = currentSkills
    agent.role = currentPrompt?.role || ""
    agent.requirements = currentPrompt?.requirements || ""
    agent.examples = currentPrompt?.examples || ""
    agent.businessLogic = messages.filter(m => m.role === "user").map(m => m.content).join("\n")
    onComplete(agent)
  }
  
  const handleRegeneratePrompt = () => {
    setIsLoading(true)
    setTimeout(() => {
      if (currentPrompt) {
        setCurrentPrompt({
          ...currentPrompt,
          requirements: currentPrompt.requirements + "\n- 保持响应简洁明了\n- 在复杂任务中分步骤执行"
        })
      }
      setIsLoading(false)
    }, 1000)
  }
  
  const handlePromptChange = (section: "role" | "requirements" | "examples", value: string) => {
    if (currentPrompt) {
      setCurrentPrompt({
        ...currentPrompt,
        [section]: value
      })
    }
  }
  
  const renderPromptSection = (
    title: string, 
    section: "role" | "requirements" | "examples", 
    content: string,
    placeholder: string
  ) => {
    const isEditing = editingSection === section
    
    return (
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground">{title}</h4>
        {isEditing ? (
          <Textarea
            value={content}
            onChange={(e) => handlePromptChange(section, e.target.value)}
            onBlur={() => setEditingSection(null)}
            className="min-h-[100px] resize-none text-sm"
            placeholder={placeholder}
            autoFocus
          />
        ) : (
          <div 
            className="cursor-pointer whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground transition-colors hover:bg-muted"
            onClick={() => setEditingSection(section)}
          >
            {content || <span className="italic text-muted-foreground/60">{placeholder}</span>}
          </div>
        )}
      </div>
    )
  }
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* 顶部栏 */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
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
      
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-6">
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
                        <div className="mt-3 space-y-2">
                          <div className="flex flex-wrap gap-1.5">
                            {message.suggestedTools.map((tool) => (
                              <Badge key={tool} variant="secondary" className="text-xs">
                                <Wrench className="mr-1 size-3" />
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {message.suggestedSkills && message.suggestedSkills.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {message.suggestedSkills.map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs border-primary/30 text-primary">
                              <Zap className="mr-1 size-3" />
                              {skill}
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
                placeholder={currentPrompt ? "描述你想修改的内容..." : "描述你想创建的智能体..."}
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
            {/* 工具和技能预览 */}
            <div className="rounded-xl border border-border bg-card p-4">
              <Tabs defaultValue="tools" className="w-full">
                <TabsList className="mb-3 grid w-full grid-cols-2">
                  <TabsTrigger value="tools" className="gap-1.5 text-xs">
                    <Wrench className="size-3.5" />
                    推荐工具
                  </TabsTrigger>
                  <TabsTrigger value="skills" className="gap-1.5 text-xs">
                    <Zap className="size-3.5" />
                    推荐技能
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="tools" className="mt-0">
                  {currentTools.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {currentTools.map((tool) => (
                        <Badge key={tool} variant="secondary" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">工具将在对话中自动推荐</p>
                  )}
                </TabsContent>
                <TabsContent value="skills" className="mt-0">
                  {currentSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {currentSkills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs border-primary/30 text-primary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">技能将在对话中自动推荐</p>
                  )}
                </TabsContent>
              </Tabs>
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
                <div className="flex-1 space-y-4 overflow-y-auto">
                  {renderPromptSection("角色", "role", currentPrompt.role, "定义智能体的角色和身份...")}
                  {renderPromptSection("使用要求", "requirements", currentPrompt.requirements, "规定智能体的行为规范...")}
                  {renderPromptSection("示例", "examples", currentPrompt.examples, "提供典型的交互示例...")}
                  <p className="text-xs text-primary">点击任意区域可直接编辑</p>
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
