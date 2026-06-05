const now = Date.now()
const day = 1000 * 60 * 60 * 24

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
    updatedAt: now - day * 1,
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
    updatedAt: now - day * 3,
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
    updatedAt: now - day * 5,
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
    updatedAt: now - day * 2,
  },
  {
    id: "translator",
    name: "翻译专家",
    avatar: "/agents/translator.png",
    tagline: "多语言翻译与润色",
    description: "支持中英日韩等多语言互译，并能根据语境进行专业润色。",
    greeting:
      "你好，我是翻译专家。无论是文档翻译、学术论文还是商务邮件，我都能帮你精准转换。",
    sampleQuestions: [
      "把这段中文翻译成英文",
      "帮我润色这封商务邮件",
      "这段日文是什么意思",
    ],
    skills: [
      { id: "translate", name: "多语翻译", description: "支持多语言互译" },
      { id: "polish", name: "文本润色", description: "优化表达与语法" },
      { id: "localize", name: "本地化", description: "文化适配翻译" },
    ],
    updatedAt: now - day * 10,
  },
  {
    id: "writer",
    name: "文案创作",
    avatar: "/agents/writer.png",
    tagline: "创意写作与内容生成",
    description: "擅长各类文案创作，包括营销文案、产品描述、社交媒体内容等。",
    greeting:
      "你好，我是文案创作助手。告诉我你的主题和风格要求，我会为你生成吸引人的内容。",
    sampleQuestions: [
      "写一段产品发布的推文",
      "帮我想几个活动宣传标题",
      "生成一篇 SEO 友好的博客文章",
    ],
    skills: [
      { id: "copywriting", name: "营销文案", description: "撰写吸引力文案" },
      { id: "storytelling", name: "故事叙述", description: "打造品牌故事" },
      { id: "seo", name: "SEO 优化", description: "搜索引擎优化写作" },
    ],
    updatedAt: now - day * 7,
  },
  {
    id: "legal",
    name: "法律顾问",
    avatar: "/agents/legal.png",
    tagline: "合同审查与法律咨询",
    description: "提供合同审查、法律条款解读、合规建议等法律相关服务。",
    greeting:
      "你好，我是法律顾问助手。我可以帮你审查合同、解读法律条款，但请注意这不构成正式法律意见。",
    sampleQuestions: [
      "审查这份劳动合同有无问题",
      "解释一下这个免责条款",
      "创业公司需要注意哪些法律问题",
    ],
    skills: [
      { id: "contract-review", name: "合同审查", description: "分析合同风险点" },
      { id: "legal-explain", name: "条款解读", description: "解释法律术语" },
      { id: "compliance", name: "合规建议", description: "提供合规指导" },
    ],
    updatedAt: now - day * 15,
  },
  {
    id: "finance",
    name: "财务分析师",
    avatar: "/agents/finance.png",
    tagline: "财务报表与投资分析",
    description: "专注财务数据分析、报表解读、投资评估与财务规划。",
    greeting:
      "你好，我是财务分析师。我可以帮你分析财务报表、评估投资机会、制定财务计划。",
    sampleQuestions: [
      "分析这家公司的财务健康状况",
      "解读这份年报的关键指标",
      "帮我做一个个人理财规划",
    ],
    skills: [
      { id: "financial-analysis", name: "财务分析", description: "分析财务数据" },
      { id: "investment", name: "投资评估", description: "评估投资机会" },
      { id: "planning", name: "财务规划", description: "制定财务计划" },
    ],
    updatedAt: now - day * 8,
  },
  {
    id: "hr",
    name: "人力资源助手",
    avatar: "/agents/hr.png",
    tagline: "招聘与员工管理",
    description: "协助招聘流程、员工培训、绩效管理、企业文化建设等人力资源工作。",
    greeting:
      "你好，我是人力资源助手。无论是招聘、培训还是员工关系问题，我都可以提供支持。",
    sampleQuestions: [
      "帮我写一份招聘 JD",
      "设计一个新员工入职培训方案",
      "如何进行有效的绩效面谈",
    ],
    skills: [
      { id: "recruiting", name: "招聘支持", description: "优化招聘流程" },
      { id: "training", name: "培训设计", description: "制定培训方案" },
      { id: "culture", name: "文化建设", description: "企业文化咨询" },
    ],
    updatedAt: now - day * 12,
  },
  {
    id: "marketing",
    name: "营销策划师",
    avatar: "/agents/marketing.png",
    tagline: "市场策略与推广",
    description: "提供市场分析、营销策略、品牌推广、增长黑客等营销相关服务。",
    greeting:
      "你好，我是营销策划师。从市场调研到活动策划，我可以帮你制定全面的营销方案。",
    sampleQuestions: [
      "分析一下竞品的营销策略",
      "制定一个新品上市推广方案",
      "如何提高用户转化率",
    ],
    skills: [
      { id: "market-analysis", name: "市场分析", description: "分析市场趋势" },
      { id: "campaign", name: "活动策划", description: "设计营销活动" },
      { id: "growth", name: "增长策略", description: "用户增长方案" },
    ],
    updatedAt: now - day * 6,
  },
  {
    id: "product",
    name: "产品经理助手",
    avatar: "/agents/product.png",
    tagline: "需求分析与产品设计",
    description: "协助产品需求分析、功能设计、用户研究、产品规划等工作。",
    greeting:
      "你好，我是产品经理助手。从需求梳理到产品规划，我可以帮你打造出色的产品。",
    sampleQuestions: [
      "帮我写一份产品需求文档",
      "分析一下这个功能的用户场景",
      "如何做好产品的竞品分析",
    ],
    skills: [
      { id: "prd", name: "需求文档", description: "撰写 PRD" },
      { id: "user-research", name: "用户研究", description: "分析用户需求" },
      { id: "roadmap", name: "产品规划", description: "制定产品路线" },
    ],
    updatedAt: now - day * 4,
  },
  {
    id: "design",
    name: "设计顾问",
    avatar: "/agents/design.png",
    tagline: "UI/UX 设计指导",
    description: "提供用户体验设计、界面设计、设计规范、可用性评估等设计咨询。",
    greeting:
      "你好，我是设计顾问。从设计灵感到可用性优化，我可以帮你提升产品的设计品质。",
    sampleQuestions: [
      "评估一下这个页面的用户体验",
      "给我一些登录页的设计建议",
      "如何建立设计规范体系",
    ],
    skills: [
      { id: "ux-review", name: "体验评估", description: "分析用户体验" },
      { id: "ui-suggest", name: "界面建议", description: "优化界面设计" },
      { id: "design-system", name: "设计规范", description: "建立设计体系" },
    ],
    updatedAt: now - day * 9,
  },
  {
    id: "devops",
    name: "运维工程师",
    avatar: "/agents/devops.png",
    tagline: "部署与系统运维",
    description: "专注于 CI/CD、容器化部署、系统监控、性能优化等运维工作。",
    greeting:
      "你好，我是运维工程师助手。从部署配置到故障排查，我可以帮你解决运维问题。",
    sampleQuestions: [
      "帮我写一个 Docker Compose 配置",
      "如何设置 GitHub Actions CI/CD",
      "服务器 CPU 占用过高怎么排查",
    ],
    skills: [
      { id: "docker", name: "容器化", description: "Docker/K8s 配置" },
      { id: "cicd", name: "CI/CD", description: "持续集成部署" },
      { id: "monitoring", name: "监控告警", description: "系统监控配置" },
    ],
    updatedAt: now - day * 11,
  },
  {
    id: "security",
    name: "安全专家",
    avatar: "/agents/security.png",
    tagline: "网络安全与漏洞分析",
    description: "提供安全评估、漏洞分析、安全加固、渗透测试指导等安全服务。",
    greeting:
      "你好，我是安全专家。从代码审计到安全加固，我可以帮你提升系统的安全性。",
    sampleQuestions: [
      "检查这段代码有没有安全漏洞",
      "如何防范 SQL 注入攻击",
      "帮我制定一个安全审计方案",
    ],
    skills: [
      { id: "audit", name: "安全审计", description: "代码安全检查" },
      { id: "pentest", name: "渗透测试", description: "模拟攻击测试" },
      { id: "hardening", name: "安全加固", description: "系统安全加固" },
    ],
    updatedAt: now - day * 20,
  },
  {
    id: "database",
    name: "数据库专家",
    avatar: "/agents/database.png",
    tagline: "数据库设计与优化",
    description: "专注于数据库架构设计、SQL 优化、数据迁移、备份恢复等工作。",
    greeting:
      "你好，我是数据库专家。从表结构设计到查询优化，我可以帮你解决数据库问题。",
    sampleQuestions: [
      "帮我设计一个电商数据库结构",
      "优化这条慢查询 SQL",
      "如何做好数据库备份策略",
    ],
    skills: [
      { id: "schema", name: "架构设计", description: "数据库表设计" },
      { id: "optimize", name: "查询优化", description: "SQL 性能优化" },
      { id: "migrate", name: "数据迁移", description: "数据库迁移" },
    ],
    updatedAt: now - day * 13,
  },
  {
    id: "customer-service",
    name: "客服助手",
    avatar: "/agents/customer-service.png",
    tagline: "客户服务与支持",
    description: "协助处理客户咨询、投诉处理、服务流程优化等客服相关工作。",
    greeting:
      "你好，我是客服助手。我可以帮你处理客户问题、优化服务流程、提升客户满意度。",
    sampleQuestions: [
      "如何回复这个客户投诉",
      "帮我写一套客服话术模板",
      "如何提升客户满意度",
    ],
    skills: [
      { id: "response", name: "话术生成", description: "生成回复话术" },
      { id: "complaint", name: "投诉处理", description: "处理客户投诉" },
      { id: "satisfaction", name: "满意度", description: "提升服务质量" },
    ],
    updatedAt: now - day * 14,
  },
  {
    id: "education",
    name: "教育辅导",
    avatar: "/agents/education.png",
    tagline: "学习辅导与知识讲解",
    description: "提供学科辅导、知识讲解、学习方法指导、课程规划等教育服务。",
    greeting:
      "你好，我是教育辅导助手。无论是概念讲解还是解题思路，我都可以耐心指导你。",
    sampleQuestions: [
      "解释一下微积分的基本概念",
      "这道数学题怎么解",
      "如何制定高效的学习计划",
    ],
    skills: [
      { id: "explain", name: "知识讲解", description: "深入浅出讲解" },
      { id: "problem-solve", name: "解题指导", description: "分析解题思路" },
      { id: "study-plan", name: "学习规划", description: "制定学习计划" },
    ],
    updatedAt: now - day * 16,
  },
  {
    id: "health",
    name: "健康顾问",
    avatar: "/agents/health.png",
    tagline: "健康咨询与生活建议",
    description: "提供健康知识科普、生活方式建议、健身计划等健康相关咨询。",
    greeting:
      "你好，我是健康顾问。我可以提供健康知识和生活建议，但请注意这不能替代专业医疗。",
    sampleQuestions: [
      "如何改善睡眠质量",
      "帮我制定一个健身计划",
      "久坐办公如何预防颈椎问题",
    ],
    skills: [
      { id: "wellness", name: "健康科普", description: "健康知识普及" },
      { id: "fitness", name: "健身指导", description: "运动计划制定" },
      { id: "nutrition", name: "营养建议", description: "饮食营养指导" },
    ],
    updatedAt: now - day * 17,
  },
  {
    id: "travel",
    name: "旅行规划师",
    avatar: "/agents/travel.png",
    tagline: "行程规划与旅行建议",
    description: "提供旅行目的地推荐、行程规划、预算评估、旅行攻略等服务。",
    greeting:
      "你好，我是旅行规划师。告诉我你的目的地和偏好，我会帮你规划完美的旅程。",
    sampleQuestions: [
      "帮我规划一个 5 天的日本行程",
      "三亚有什么必去的景点",
      "如何用 5000 元预算玩转云南",
    ],
    skills: [
      { id: "itinerary", name: "行程规划", description: "定制旅行路线" },
      { id: "recommend", name: "景点推荐", description: "推荐热门景点" },
      { id: "budget", name: "预算评估", description: "旅行费用估算" },
    ],
    updatedAt: now - day * 18,
  },
  {
    id: "assistant",
    name: "日程助理",
    avatar: "/agents/assistant.png",
    tagline: "日程管理与提醒",
    description: "协助管理日程安排、待办事项、会议提醒、时间规划等个人事务。",
    greeting:
      "你好，我是日程助理。我可以帮你管理时间、安排日程、设置提醒，让你的工作更有条理。",
    sampleQuestions: [
      "帮我整理这周的工作安排",
      "如何更好地管理待办事项",
      "帮我规划明天的日程",
    ],
    skills: [
      { id: "schedule", name: "日程管理", description: "安排日程计划" },
      { id: "todo", name: "待办管理", description: "管理待办事项" },
      { id: "reminder", name: "智能提醒", description: "设置事项提醒" },
    ],
    updatedAt: now - day * 19,
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
