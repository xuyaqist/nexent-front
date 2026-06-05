import type { Agent } from "./types"

export function createEmptyAgent(): Agent {
  const id = `agent_${Date.now()}`
  return {
    id,
    name: "未命名智能体",
    variableName: "untitled_agent",
    author: "Default User",
    model: "kimi-k2.5",
    maxSteps: 20,
    runSummary: "否",
    description: "",
    businessLogic: "",
    promptTemplate: "系统默认",
    role: "",
    requirements: "",
    examples: "",
    tools: [],
    collaborators: [],
    status: "draft",
    updatedAt: new Date().toISOString(),
  }
}

// 将外部 JSON 归一化为合法的 Agent，缺失字段使用默认值，始终生成新 id 与草稿状态
export function normalizeImportedAgent(raw: unknown): Agent {
  const base = createEmptyAgent()
  const data = (raw && typeof raw === "object" ? raw : {}) as Partial<Agent>
  return {
    ...base,
    ...data,
    id: `agent_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: typeof data.name === "string" && data.name.trim() ? data.name : "导入的智能体",
    tools: Array.isArray(data.tools) ? data.tools : [],
    collaborators: Array.isArray(data.collaborators) ? data.collaborators : [],
    status: "draft",
    updatedAt: new Date().toISOString(),
  }
}

export const SAMPLE_AGENTS: Agent[] = [
  {
    id: "agent_excel",
    name: "Excel文档创建助手",
    variableName: "excel_creation_assistant",
    author: "Default User",
    model: "kimi-k2.5",
    maxSteps: 20,
    runSummary: "否",
    description:
      "你是一个Excel文档创建助手，能够帮助用户创建各类电子表格并提供专业的表格设计、公式编写和数据整理服务。你可以根据需求生成结构清晰的Excel文档，协助完成数据录入、格式优化和计算分析等工作。",
    businessLogic: "excel文档创建助手",
    promptTemplate: "系统默认",
    role: "专业的电子表格创建与数据处理专家。",
    requirements: "用户需提供数据内容或表格结构需求。",
    examples: "用户：帮我做一份月度销售统计表。",
    tools: ["create_docx", "query"],
    collaborators: [],
    status: "published",
    updatedAt: "2026-05-20T09:00:00.000Z",
  },
  {
    id: "agent_writer",
    name: "智能写作助手",
    variableName: "writing_assistant",
    author: "Default User",
    model: "claude-opus-4.6",
    maxSteps: 15,
    runSummary: "是",
    description: "帮助用户撰写、润色和优化各类文案，包括公文、营销文案、邮件等多种文体。",
    businessLogic: "智能写作与文案润色",
    promptTemplate: "通用助手",
    role: "资深文案与内容创作专家。",
    requirements: "用户需提供写作主题或原始文本。",
    examples: "用户：帮我润色这封商务邮件。",
    tools: ["create_docx", "web_search"],
    collaborators: [],
    status: "published",
    updatedAt: "2026-05-18T14:30:00.000Z",
  },
  {
    id: "agent_data",
    name: "数据分析专家",
    variableName: "data_analyst",
    author: "Default User",
    model: "gpt-5-mini",
    maxSteps: 30,
    runSummary: "是",
    description: "对接数据库与文件，进行数据清洗、统计分析与可视化报告生成。",
    businessLogic: "数据分析与可视化",
    promptTemplate: "数据分析",
    role: "数据科学与商业分析专家。",
    requirements: "用户需提供数据源或分析目标。",
    examples: "用户：分析这份用户留存数据并给出结论。",
    tools: ["query", "doc_search", "image_understand"],
    collaborators: [],
    status: "draft",
    updatedAt: "2026-05-22T11:15:00.000Z",
  },
]
