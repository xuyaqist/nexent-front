export interface Agent {
  id: string
  name: string
  variableName: string
  author: string
  model: string
  maxSteps: number
  runSummary: "是" | "否"
  description: string
  businessLogic: string
  promptTemplate: string
  role: string
  requirements: string
  examples: string
  tools: string[]
  collaborators: string[]
  status: "draft" | "published"
  updatedAt: string
}

export const MODELS = ["kimi-k2.5", "gpt-5-mini", "claude-opus-4.6", "gemini-3-flash", "qwen-max"]

export const PROMPT_TEMPLATES = ["系统默认", "通用助手", "代码专家", "数据分析"]

export const TOOL_GROUPS: { category: string; tools: string[] }[] = [
  { category: "database", tools: ["query", "insert", "update", "delete"] },
  { category: "docx", tools: ["create_docx", "read_docx", "edit_docx"] },
  { category: "email", tools: ["send_email", "read_inbox"] },
  { category: "file", tools: ["read_file", "write_file", "list_dir"] },
  { category: "multimodal", tools: ["image_understand", "ocr"] },
  { category: "search", tools: ["web_search", "doc_search"] },
  { category: "terminal", tools: ["run_command"] },
]

export const TOOL_SOURCES = [
  "本地工具",
  "docx",
  "ai.autonomad...",
  "12306",
  "outer-apis",
  "deepwiki",
  "Vis",
  "Paper",
]
