import type { AgentId, HitlPart, PlanPart, Source, ToolPart, TokenUsage } from "./types"

export interface Scenario {
  reasoning: string
  plan?: PlanPart
  tools: ToolPart[]
  hitl?: HitlPart
  answer: string
  usage: TokenUsage
  suggestions: string[]
  /** cited sources backing the answer, referenced inline as [n] */
  sources?: Source[]
}

function estimateTokens(text: string): number {
  // rough heuristic for the demo
  return Math.max(1, Math.round(text.length / 2.2))
}

/**
 * Builds a scripted assistant turn for the demo. Different agents produce
 * different reasoning / planning / tool / HITL flows so all features are visible.
 */
export function buildScenario(agentId: AgentId | null, userText: string): Scenario {
  const promptTokens = estimateTokens(userText) + 240

  if (agentId === "data") {
    const answer =
      "根据导入的数据集，最近 30 天活跃用户从 12,400 增长到 18,900，整体增幅约 **52%**[1]。增长主要集中在第 3 周（新版本上线后），周留存率从 38% 提升到 45%[3]。\n\n建议关注：渠道 A 的获客成本偏高，转化漏斗在「注册→首次使用」环节流失最严重（约 41%）[2]。"
    return {
      reasoning:
        "用户想分析用户增长趋势。我需要：1) 确认数据时间范围；2) 计算环比增幅与留存；3) 定位增长来源；4) 检查是否存在异常值。先拉取数据，再分阶段统计，最后判断哪些结论需要人工确认后再生成报告。",
      plan: {
        type: "plan",
        title: "数据分析执行计划",
        revised: false,
        steps: [
          { id: "p1", title: "加载并清洗数据集", status: "done" },
          { id: "p2", title: "计算增长率与留存指标", status: "done" },
          { id: "p3", title: "定位增长来源渠道", status: "in_progress" },
          { id: "p4", title: "生成可视化报告", status: "pending" },
        ],
      },
      tools: [
        {
          type: "tool",
          name: "sql_query",
          input: "SELECT date, active_users FROM events WHERE date >= now() - 30d",
          output: "返回 30 行记录，活跃用户区间 [12400, 18900]",
          status: "done",
        },
      ],
      hitl: {
        type: "hitl",
        title: "需要你确认",
        description: "即将把分析结果导出为一份共享报告，并发送给「增长团队」频道。是否继续？",
        action: "导出并发送报告",
        status: "pending",
      },
      answer,
      usage: { prompt: promptTokens, completion: estimateTokens(answer), total: promptTokens + estimateTokens(answer) },
      suggestions: ["渠道 A 的获客成本为什么偏高？", "帮我优化注册到首次使用的转化漏斗", "预测下个月的活跃用户数"],
      sources: [
        {
          id: 1,
          type: "knowledge",
          title: "events 数据表（近 30 天）",
          collection: "业务数据库",
          snippet: "active_users 字段记录每日活跃用户，区间 [12,400, 18,900]，环比增幅约 52%。",
        },
        {
          id: 2,
          type: "knowledge",
          title: "渠道归因表 channel_attribution",
          collection: "业务数据库",
          snippet: "渠道 A 的 CAC 为 ¥86，高于均值 ¥52；注册→首次使用流失率约 41%。",
        },
        {
          id: 3,
          type: "knowledge",
          title: "留存看板 retention_daily",
          collection: "业务数据库",
          snippet: "新版本上线后第 3 周周留存率由 38% 提升至 45%。",
        },
      ],
    }
  }

  if (agentId === "research") {
    const answer =
      "综合多个来源，2026 年主流的 AI Agent 架构大致可分为三类：\n\n1. **规划-执行型（Planner-Executor）**：先生成策略计划再分步执行，适合长任务，可在中途修订计划[1]。\n2. **ReAct 推理-行动型**：推理与工具调用交替进行，反应灵活但长程一致性较弱[2]。\n3. **多智能体协作型**：由编排器调度多个专精子智能体协同完成任务[3]。\n\n趋势上，三者正在融合：以规划为骨架、ReAct 为执行循环、并按需派生子智能体[1][3]。"
    return {
      reasoning:
        "这是一个调研类问题，需要多轮检索并交叉验证。先拆解为「架构分类」「代表实现」「发展趋势」三个子问题，分别检索权威来源，标注引用，最后归纳成结构化综述。检索量较大，先列计划。",
      plan: {
        type: "plan",
        title: "调研计划（可中途修订）",
        revised: true,
        steps: [
          { id: "p1", title: "拆解研究子问题", status: "done" },
          { id: "p2", title: "检索并交叉验证来源", status: "done" },
          { id: "p3", title: "归纳架构分类", status: "in_progress" },
          { id: "p4", title: "撰写结构化综述", status: "pending" },
        ],
      },
      tools: [
        {
          type: "tool",
          name: "deep_search",
          input: "AI agent architecture 2026 planner executor react multi-agent",
          output: "命中 18 篇高相关来源，已去重保留 9 篇",
          status: "done",
        },
      ],
      answer,
      usage: { prompt: promptTokens, completion: estimateTokens(answer), total: promptTokens + estimateTokens(answer) },
      suggestions: ["展开讲讲多智能体协作的编排策略", "这三类架构各自的代表开源项目有哪些？", "帮我整理成一页幻灯片大纲"],
      sources: [
        {
          id: 1,
          type: "web",
          title: "Agent Architectures Survey 2026 — arXiv",
          url: "https://arxiv.org/abs/2601.01234",
          snippet: "提出以规划为骨架、ReAct 为执行循环的混合架构，并支持中途修订策略计划。",
        },
        {
          id: 2,
          type: "web",
          title: "ReAct: Synergizing Reasoning and Acting — LangGraph 官方文档",
          url: "https://langchain-ai.github.io/langgraph/concepts/react/",
          snippet: "推理与工具调用交替进行，反应灵活，但在长程任务中一致性较弱。",
        },
        {
          id: 3,
          type: "web",
          title: "AutoGen 多智能体协作白皮书",
          url: "https://microsoft.github.io/autogen/",
          snippet: "由编排器调度多个专精子智能体协同完成复杂任务，可按需派生新角色。",
        },
      ],
    }
  }

  if (agentId === "coder") {
    const answer =
      "下面是一个带类型的防抖函数：\n\n```ts\nfunction debounce<T extends (...args: any[]) => void>(\n  fn: T,\n  delay = 300,\n) {\n  let timer: ReturnType<typeof setTimeout> | null = null\n  return (...args: Parameters<T>) => {\n    if (timer) clearTimeout(timer)\n    timer = setTimeout(() => fn(...args), delay)\n  }\n}\n```\n\n它在每次调用时重置计时器，只有在停止触发 `delay` 毫秒后才真正执行 `fn`。"
    return {
      reasoning:
        "用户要一个防抖函数。要点：保留泛型以保证参数类型安全、使用闭包保存定时器、调用时清除上一次定时器。直接给出实现并简要说明原理即可，不需要调用工具。",
      plan: {
        type: "plan",
        title: "实现计划",
        steps: [
          { id: "p1", title: "确定函数签名与泛型约束", status: "done" },
          { id: "p2", title: "实现闭包计时逻辑", status: "done" },
          { id: "p3", title: "补充用法说明", status: "in_progress" },
        ],
      },
      tools: [],
      answer,
      usage: { prompt: promptTokens, completion: estimateTokens(answer), total: promptTokens + estimateTokens(answer) },
      suggestions: ["再给我一个节流（throttle）函数", "怎么在 React 里用这个防抖？", "加上立即执行（leading）选项"],
    }
  }

  // general agent
  const answer =
    "好的，我来帮你处理这个问题。\n\n我先梳理了任务目标，制定了执行计划，并调用了检索工具收集相关信息。综合来看，关键结论如下：\n\n- 核心要点已经过多源交叉验证，可信度较高[1]；\n- 部分操作涉及外部副作用，已请你确认[2]；\n- 如需更深入的分析，我可以进一步展开。\n\n还有什么需要我补充的吗？"
  return {
    reasoning:
      "先理解用户意图，判断是否需要外部工具。这里需要检索信息并可能产生副作用，因此先制定计划，执行检索，遇到需要授权的动作时暂停等待用户确认，最后汇总回答。",
    plan: {
      type: "plan",
      title: "任务执行计划",
      steps: [
        { id: "p1", title: "理解任务目标", status: "done" },
        { id: "p2", title: "检索相关信息", status: "done" },
        { id: "p3", title: "等待用户授权敏感操作", status: "in_progress" },
        { id: "p4", title: "汇总并输出结论", status: "pending" },
      ],
    },
    tools: [
      {
        type: "tool",
        name: "web_search",
        input: userText.slice(0, 40),
        output: "检索到 6 条相关结果，已提取摘要",
        status: "done",
      },
    ],
    hitl: {
      type: "hitl",
      title: "需要你确认",
      description: "该操作会调用外部工具并可能修改数据。是否授权我继续执行？",
      action: "授权执行",
      status: "pending",
    },
    answer,
    usage: { prompt: promptTokens, completion: estimateTokens(answer), total: promptTokens + estimateTokens(answer) },
    suggestions: ["把上面的结论整理成要点清单", "这个结论的信息来源是什么？", "换一个角度再分析一下"],
    sources: [
      {
        id: 1,
        type: "web",
        title: "web_search 检索摘要（6 条相关结果）",
        url: "https://www.google.com/search?q=" + encodeURIComponent(userText.slice(0, 40)),
        snippet: "对检索到的 6 条相关结果进行去重与摘要，关键结论在多个来源间一致。",
      },
      {
        id: 2,
        type: "knowledge",
        title: "对话历史上下文",
        collection: "会话记忆",
        snippet: "结合本次会话中先前的目标与约束，判断该操作涉及外部副作用，需人工确认。",
      },
    ],
  }
}

export const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
