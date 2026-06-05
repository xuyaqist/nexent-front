import type { Agent, Conversation } from "./types"

export const AGENTS: Agent[] = [
  {
    id: "general",
    name: "Nexent 智能体",
    avatar: "/agents/general.png",
    tagline: "通用多模态助手",
    description:
      "Nexent 是一个开源智能体平台，基于 MCP 工具生态系统，提供灵活的多模态问答、检索、数据分析、处理等能力。",
    greeting:
      "你好，我是 Nexent 智能体。我可以帮你检索资料、分析数据、总结文档，也能调用各类工具完成复杂任务。有什么可以帮你的吗？",
    sampleQuestions: [
      "帮我总结这份季度财报的核心要点",
      "对比一下 Next.js 和 Remix 的优缺点",
      "用一句话解释什么是 MCP 协议",
      "制定一个为期一周的学习计划",
    ],
    skills: [
      { id: "web-search", name: "联网搜索", description: "实时检索互联网信息" },
      { id: "doc-summary", name: "文档总结", description: "提炼长文档核心要点" },
      { id: "image-understand", name: "图片解析", description: "理解图片中的内容" },
    ],
  },
  {
    id: "data",
    name: "数据分析师",
    avatar: "/agents/data.png",
    tagline: "数据洞察与可视化",
    description: "擅长处理结构化数据，进行统计分析、趋势预测并生成可视化图表。",
    greeting:
      "你好，我是数据分析师。上传你的数据集或描述你的指标，我会帮你发现其中的规律与洞察。",
    sampleQuestions: [
      "分析最近 30 天的用户增长趋势",
      "找出销售数据中的异常值",
      "帮我生成一份漏斗分析报告",
    ],
    skills: [
      { id: "sql", name: "SQL 查询", description: "生成并执行 SQL" },
      { id: "chart", name: "图表生成", description: "把数据转成可视化图表" },
      { id: "forecast", name: "趋势预测", description: "基于历史数据做预测" },
    ],
  },
  {
    id: "research",
    name: "研究助理",
    avatar: "/agents/research.png",
    tagline: "深度调研与综述",
    description: "用于深度主题调研，收集多方信息源并形成结构化研究综述。",
    greeting:
      "你好，我是研究助理。给我一个研究主题，我会进行多轮检索、交叉验证并产出一份结构化报告。",
    sampleQuestions: [
      "调研 2026 年 AI Agent 的主流架构",
      "整理量子计算的最新进展",
      "对比三家云厂商的 Serverless 方案",
    ],
    skills: [
      { id: "deep-search", name: "深度检索", description: "多轮迭代式资料检索" },
      { id: "cite", name: "引用溯源", description: "为结论标注来源" },
      { id: "outline", name: "大纲生成", description: "生成结构化研究大纲" },
    ],
  },
  {
    id: "coder",
    name: "编程助手",
    avatar: "/agents/coder.png",
    tagline: "代码生成与调试",
    description: "面向工程场景，帮助编写、审查、重构与调试代码。",
    greeting:
      "你好，我是编程助手。描述你的需求或贴上报错信息，我会帮你写代码、查 bug、做重构。",
    sampleQuestions: [
      "用 TypeScript 写一个防抖函数",
      "帮我审查这段 React 组件的性能问题",
      "解释这个报错并给出修复方案",
    ],
    skills: [
      { id: "codegen", name: "代码生成", description: "根据需求生成代码" },
      { id: "review", name: "代码审查", description: "审查代码质量与隐患" },
      { id: "run", name: "运行沙箱", description: "在沙箱中执行代码" },
    ],
  },
]

export function getAgent(id: string | null | undefined): Agent | undefined {
  return AGENTS.find((a) => a.id === id)
}

const now = Date.now()
const hour = 1000 * 60 * 60

export const INITIAL_CONVERSATIONS: Conversation[] = [
  { id: "c1", title: "图片内容解析", agentId: "general", messages: [], updatedAt: now - hour * 2 },
  { id: "c2", title: "季度财报总结", agentId: "general", messages: [], updatedAt: now - hour * 5 },
  { id: "c3", title: "用户增长趋势分析", agentId: "data", messages: [], updatedAt: now - hour * 26 },
  { id: "c4", title: "AI Agent 架构调研", agentId: "research", messages: [], updatedAt: now - hour * 28 },
  { id: "c5", title: "防抖函数实现", agentId: "coder", messages: [], updatedAt: now - hour * 50 },
  { id: "c6", title: "文档总结要点", agentId: "general", messages: [], updatedAt: now - hour * 72 },
]
