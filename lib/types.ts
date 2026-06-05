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
  skills: string[]
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

// 技能定义
export const SKILL_GROUPS: { category: string; skills: { name: string; description: string }[] }[] = [
  {
    category: "数据处理",
    skills: [
      { name: "数据清洗", description: "自动识别和清理脏数据、缺失值和异常值" },
      { name: "数据转换", description: "在不同数据格式之间进行转换" },
      { name: "数据聚合", description: "对数据进行分组、汇总和统计计算" },
    ]
  },
  {
    category: "文档处理",
    skills: [
      { name: "文档摘要", description: "从长文档中提取关键信息生成摘要" },
      { name: "格式转换", description: "在 Word、PDF、Markdown 等格式间转换" },
      { name: "模板填充", description: "根据数据自动填充文档模板" },
    ]
  },
  {
    category: "沟通协作",
    skills: [
      { name: "邮件撰写", description: "根据场景生成专业的邮件内容" },
      { name: "会议纪要", description: "整理会议记录生成结构化纪要" },
      { name: "任务分解", description: "将复杂任务分解为可执行的子任务" },
    ]
  },
  {
    category: "分析推理",
    skills: [
      { name: "趋势分析", description: "识别数据中的趋势和模式" },
      { name: "根因分析", description: "追溯问题根本原因" },
      { name: "决策建议", description: "基于数据给出决策建议" },
    ]
  },
]

export const ALL_SKILLS = SKILL_GROUPS.flatMap(g => g.skills.map(s => s.name))
