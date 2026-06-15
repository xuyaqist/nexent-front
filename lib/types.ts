export type AgentId = string

export interface Skill {
  id: string
  name: string
  description: string
}

/** An MCP (Model Context Protocol) tool that can be invoked inline via @ */
export interface McpTool {
  id: string
  name: string
  description: string
  /** the MCP server this tool belongs to */
  server: string
}

export interface Agent {
  id: AgentId
  name: string
  avatar: string
  tagline: string
  description: string
  greeting: string
  sampleQuestions: string[]
  skills: Skill[]
  /** Timestamp when the agent was last updated/edited */
  updatedAt?: number
}

export interface TokenUsage {
  prompt: number
  completion: number
  total: number
}

/** A cited information source backing part of an answer. */
export interface Source {
  /** citation index referenced inline as [n] */
  id: number
  /** retrieval channel: web search vs knowledge base */
  type: "web" | "knowledge"
  /** display title of the source */
  title: string
  /** short excerpt / snippet supporting the citation */
  snippet?: string
  /** url for web sources */
  url?: string
  /** knowledge base / collection name for knowledge sources */
  collection?: string
}

export interface PlanStep {
  id: string
  title: string
  status: "pending" | "in_progress" | "done"
}

export type TaskStatus = "idle" | "running" | "awaiting" | "done" | "stopped"

export interface ContextItem {
  id: string
  kind: "agent" | "status" | "request" | "tool" | "source" | "memory"
  label: string
  value: string
}

export interface ReasoningPart {
  type: "reasoning"
  text: string
}

export interface TextPart {
  type: "text"
  text: string
}

export interface PlanPart {
  type: "plan"
  title: string
  steps: PlanStep[]
  /** Whether the agent paused to (re)generate this strategic plan */
  revised?: boolean
}

export interface ToolPart {
  type: "tool"
  name: string
  input: string
  output: string
  status: "running" | "done"
}

export type HitlStatus = "pending" | "approved" | "rejected"

export interface HitlPart {
  type: "hitl"
  title: string
  description: string
  action: string
  status: HitlStatus
}

// NOTE: PlanPart is intentionally NOT part of the inline message stream.
// The strategic plan is surfaced in the right-side TaskPanel via Conversation.plan.
export type MessagePart = ReasoningPart | TextPart | ToolPart | HitlPart

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  parts: MessagePart[]
  /** assistant only */
  agentId?: AgentId
  usage?: TokenUsage
  createdAt: number
  /** still being streamed */
  streaming?: boolean
}

export interface Conversation {
  id: string
  title: string
  agentId: AgentId | null
  messages: ChatMessage[]
  updatedAt: number
  /** suggested follow-up questions for the next turn */
  suggestions?: string[]
  /** cited sources backing the latest answer (referenced inline as [n]) */
  sources?: Source[]
  /** strategic plan shown in the right-side task panel (not inline) */
  plan?: PlanPart
  /** assistant-ui style context display items for the current/last turn */
  context?: ContextItem[]
  /** current task lifecycle status for the panel */
  taskStatus?: TaskStatus
}
