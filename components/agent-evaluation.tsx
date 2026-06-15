"use client"

import { useRef, useState } from "react"
import {
  ArrowLeft,
  Bot,
  Download,
  Upload,
  Play,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  RotateCcw,
  TrendingUp,
  Cpu,
  GitBranch,
  History,
} from "lucide-react"
import type { Agent } from "@/lib/types"
import { MODELS } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface AgentEvaluationProps {
  agent: Agent
  onBack: () => void
}

// 单条测试用例评估结果
interface EvalCase {
  id: number
  input: string
  expected: string
  actual: string
  score: number
  status: "pass" | "fail" | "partial"
  latencyMs: number
  reason: string
}

// 测评版本历史记录
interface EvalHistory {
  id: string
  version: string
  model: string
  score: number
  passRate: number
  caseCount: number
  evaluatedAt: string
}

// CSV 模板列
const TEMPLATE_HEADERS = ["序号", "测试输入", "预期输出", "备注"]

// 根据当前版本号与版本数量，构造可选版本列表（首项为最新版本）
function buildVersionOptions(agent: Agent): string[] {
  const match = agent.version.match(/^v(\d+)\.(\d+)$/)
  let major = 1
  let minor = 0
  if (match) {
    major = Number(match[1])
    minor = Number(match[2])
  }
  const list: string[] = []
  for (let i = 0; i < Math.max(agent.versionCount, 1); i++) {
    let m = minor - i
    let mj = major
    while (m < 0) {
      mj -= 1
      m += 10
    }
    list.push(`v${mj}.${m}`)
  }
  return list
}

// 预置的历史测评记录（模拟过往不同版本的评估结果）
function buildMockHistory(agent: Agent): EvalHistory[] {
  const versions = buildVersionOptions(agent)
  const base = [
    { daysAgo: 3, model: "gpt-5-mini", score: 88, passRate: 83 },
    { daysAgo: 9, model: "kimi-k2.5", score: 79, passRate: 67 },
    { daysAgo: 18, model: "claude-opus-4.6", score: 72, passRate: 50 },
  ]
  return base.slice(0, Math.max(versions.length, 1)).map((b, i) => {
    const d = new Date()
    d.setDate(d.getDate() - b.daysAgo)
    return {
      id: `h_${i}`,
      version: versions[Math.min(i + 1, versions.length - 1)] ?? versions[0],
      model: b.model,
      score: b.score,
      passRate: b.passRate,
      caseCount: 6,
      evaluatedAt: d.toISOString(),
    }
  })
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// 模拟生成的测试用例（用户上传后展示）
const MOCK_INPUTS = [
  "帮我做一份本月销售统计表",
  "查询上季度华东区的营收数据",
  "把这份报告导出成 PDF",
  "统计每个销售员的成单率",
  "生成一封催款提醒邮件",
  "分析最近三个月的退货趋势",
]

function buildMockCases(): EvalCase[] {
  return MOCK_INPUTS.map((input, i) => {
    const score = Math.round((0.62 + Math.random() * 0.38) * 100)
    const status: EvalCase["status"] = score >= 85 ? "pass" : score >= 70 ? "partial" : "fail"
    const reasonMap: Record<EvalCase["status"], string> = {
      pass: "输出与预期高度一致，关键字段完整。",
      partial: "核心结果正确，但部分细节或格式存在偏差。",
      fail: "输出缺失关键信息或与预期不符。",
    }
    return {
      id: i + 1,
      input,
      expected: "符合业务规范的结构化结果",
      actual: status === "fail" ? "结果不完整 / 偏离预期" : "结构化结果已生成",
      score,
      status,
      latencyMs: 800 + Math.round(Math.random() * 2400),
      reason: reasonMap[status],
    }
  })
}

const STATUS_META: Record<
  EvalCase["status"],
  { label: string; icon: typeof CheckCircle2; className: string; badge: string }
> = {
  pass: {
    label: "通过",
    icon: CheckCircle2,
    className: "text-emerald-600",
    badge: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  partial: {
    label: "部分通过",
    icon: AlertCircle,
    className: "text-amber-600",
    badge: "bg-amber-50 text-amber-600 border-amber-200",
  },
  fail: {
    label: "未通过",
    icon: XCircle,
    className: "text-destructive",
    badge: "bg-red-50 text-destructive border-red-200",
  },
}

export function AgentEvaluation({ agent, onBack }: AgentEvaluationProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle")
  const [progress, setProgress] = useState(0)
  const [cases, setCases] = useState<EvalCase[]>([])

  // 测评配置：模型与智能体版本
  const versionOptions = buildVersionOptions(agent)
  const [evalModel, setEvalModel] = useState<string>(MODELS[0])
  const [evalVersion, setEvalVersion] = useState<string>(versionOptions[0])

  // 测评版本历史
  const [history, setHistory] = useState<EvalHistory[]>(() => buildMockHistory(agent))

  // 下载 CSV 模板（Excel 可直接打开）
  const handleDownloadTemplate = () => {
    const sample = [
      ["1", "帮我做一份本月销售统计表", "包含日期、金额、销售员的统计表格", "可选"],
      ["2", "查询上季度华东区的营收数据", "返回华东区营收汇总数字", ""],
    ]
    const rows = [TEMPLATE_HEADERS, ...sample]
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n")
    // 加 BOM 以确保 Excel 正确识别中文
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${agent.variableName || "agent"}_测试用例模板.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      setPhase("idle")
      setCases([])
      setProgress(0)
    }
    e.target.value = ""
  }

  // 模拟运行评估
  const handleRunEvaluation = () => {
    setPhase("running")
    setProgress(0)
    setCases([])
    const total = MOCK_INPUTS.length
    const all = buildMockCases()
    let i = 0
    const timer = setInterval(() => {
      i += 1
      setCases(all.slice(0, i))
      setProgress(Math.round((i / total) * 100))
      if (i >= total) {
        clearInterval(timer)
        setPhase("done")
        // 评估完成后写入版本历史
        const passN = all.filter((c) => c.status === "pass").length
        const avg = Math.round(all.reduce((s, c) => s + c.score, 0) / all.length)
        const rate = Math.round((passN / all.length) * 100)
        setHistory((prev) => [
          {
            id: `h_${Date.now()}`,
            version: evalVersion,
            model: evalModel,
            score: avg,
            passRate: rate,
            caseCount: all.length,
            evaluatedAt: new Date().toISOString(),
          },
          ...prev,
        ])
      }
    }, 600)
  }

  // 评估报告统计
  const total = cases.length
  const passCount = cases.filter((c) => c.status === "pass").length
  const partialCount = cases.filter((c) => c.status === "partial").length
  const failCount = cases.filter((c) => c.status === "fail").length
  const avgScore = total ? Math.round(cases.reduce((s, c) => s + c.score, 0) / total) : 0
  const avgLatency = total ? Math.round(cases.reduce((s, c) => s + c.latencyMs, 0) / total) : 0
  const passRate = total ? Math.round((passCount / total) * 100) : 0

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部栏 - 智能体信息 */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} aria-label="返回管理页" className="shrink-0">
              <ArrowLeft className="size-5" />
            </Button>
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
              <Bot className="size-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate font-semibold text-foreground">{agent.name || "未命名智能体"}</h1>
                <Badge variant="outline" className="shrink-0 gap-1 border-primary/30 text-primary">
                  <TrendingUp className="size-3" />
                  效果评估
                </Badge>
              </div>
              <p className="truncate text-sm text-muted-foreground">{agent.description || "暂无描述"}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        {/* 步骤一：测试用例 */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              1
            </span>
            <h2 className="text-base font-semibold text-foreground">准备测试用例</h2>
          </div>

          {/* 测评配置：模型 + 智能体版本 */}
          <div className="mb-5 grid gap-4 rounded-lg border border-border bg-secondary/30 p-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Cpu className="size-4 text-primary" />
                测评模型
              </label>
              <Select value={evalModel} onValueChange={setEvalModel} disabled={phase === "running"}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择测评模型" />
                </SelectTrigger>
                <SelectContent>
                  {MODELS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">用于对智能体输出进行打分评判的模型。</p>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <GitBranch className="size-4 text-primary" />
                智能体版本
              </label>
              <Select value={evalVersion} onValueChange={setEvalVersion} disabled={phase === "running"}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择智能体版本" />
                </SelectTrigger>
                <SelectContent>
                  {versionOptions.map((v, i) => (
                    <SelectItem key={v} value={v}>
                      {v}
                      {i === 0 ? "（最新）" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">选择要评估的智能体版本。</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* 下载模板 */}
            <div className="flex flex-col items-start gap-3 rounded-lg border border-border bg-secondary/30 p-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-primary">
                <FileSpreadsheet className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">下载测试用例模板</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  按模板格式填写测试输入与预期输出（Excel 可直接打开）。
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownloadTemplate}>
                <Download className="size-4" />
                下载模板
              </Button>
            </div>

            {/* 上传用例 */}
            <div className="flex flex-col items-start gap-3 rounded-lg border border-border bg-secondary/30 p-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-primary">
                <Upload className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">上传评估测试用例</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {fileName ? `已选择：${fileName}` : "支持 .xlsx / .csv 格式的测试用例文件。"}
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,text/csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => fileInputRef.current?.click()}>
                <Upload className="size-4" />
                {fileName ? "重新上传" : "上传用例"}
              </Button>
            </div>
          </div>

          {/* 运行按钮 */}
          <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
            <p className="text-sm text-muted-foreground">
              {fileName ? "用例已就绪，点击右侧按钮开始评估。" : "请先上传测试用例文件。"}
            </p>
            <Button
              onClick={handleRunEvaluation}
              disabled={!fileName || phase === "running"}
              className="gap-1.5"
            >
              {phase === "running" ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  评估中…
                </>
              ) : phase === "done" ? (
                <>
                  <RotateCcw className="size-4" />
                  重新评估
                </>
              ) : (
                <>
                  <Play className="size-4" />
                  开始评估
                </>
              )}
            </Button>
          </div>

          {phase === "running" && (
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                <span>正在执行测试用例…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </section>

        {/* 步骤���：逐条评估结果 */}
        {cases.length > 0 && (
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="mb-5 flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                2
              </span>
              <h2 className="text-base font-semibold text-foreground">测试用例评估结果</h2>
              <span className="text-sm text-muted-foreground">（{cases.length} 条）</span>
            </div>

            <div className="space-y-3">
              {cases.map((c) => {
                const meta = STATUS_META[c.status]
                const Icon = meta.icon
                return (
                  <div key={c.id} className="rounded-lg border border-border p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-medium text-primary">
                          {c.id}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">{c.input}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{c.reason}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-sm font-semibold text-foreground">{c.score}</span>
                        <Badge variant="outline" className={"gap-1 " + meta.badge}>
                          <Icon className="size-3" />
                          {meta.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-3 border-t border-border pt-3 text-xs sm:grid-cols-3">
                      <div>
                        <span className="text-muted-foreground">预期输出</span>
                        <p className="mt-0.5 text-foreground">{c.expected}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">实际输出</span>
                        <p className="mt-0.5 text-foreground">{c.actual}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">响应耗时</span>
                        <p className="mt-0.5 text-foreground">{(c.latencyMs / 1000).toFixed(1)}s</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* 步骤三：评估报告 */}
        {phase === "done" && (
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="mb-5 flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                3
              </span>
              <h2 className="text-base font-semibold text-foreground">评估报告</h2>
            </div>

            {/* 关键指标 */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <MetricCard label="通过率" value={`${passRate}%`} highlight />
              <MetricCard label="平均得分" value={`${avgScore}`} />
              <MetricCard label="平均耗时" value={`${(avgLatency / 1000).toFixed(1)}s`} />
              <MetricCard label="用例总数" value={`${total}`} />
            </div>

            {/* 通过情况分布 */}
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-medium text-foreground">结果分布</h3>
              <div className="flex h-3 overflow-hidden rounded-full bg-secondary">
                {passCount > 0 && (
                  <div className="bg-emerald-500" style={{ width: `${(passCount / total) * 100}%` }} />
                )}
                {partialCount > 0 && (
                  <div className="bg-amber-500" style={{ width: `${(partialCount / total) * 100}%` }} />
                )}
                {failCount > 0 && (
                  <div className="bg-destructive" style={{ width: `${(failCount / total) * 100}%` }} />
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-emerald-500" />
                  通过 {passCount}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-amber-500" />
                  部分通过 {partialCount}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-destructive" />
                  未通过 {failCount}
                </span>
              </div>
            </div>

            {/* 评估结论 */}
            <div className="mt-6 rounded-lg border border-border bg-secondary/30 p-4">
              <h3 className="mb-2 text-sm font-medium text-foreground">评估结论</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                本次共评估 {total} 条测试用例，整体通过率为 <span className="font-medium text-foreground">{passRate}%</span>，
                平均得分 <span className="font-medium text-foreground">{avgScore}</span> 分。
                {passRate >= 80
                  ? "智能体表现优秀，已满足上线标准，建议关注少量未通过用例做针对性优化。"
                  : passRate >= 60
                    ? "智能体表现中等，建议优化提示词与工具配置后重新评估。"
                    : "智能体表现欠佳，建议重点排查未通过用例，完善业务逻辑与提示词后再次评估。"}
              </p>
            </div>

            <div className="mt-5 flex justify-end">
              <Button variant="outline" className="gap-1.5" onClick={handleDownloadTemplate}>
                <Download className="size-4" />
                导出评估报告
              </Button>
            </div>
          </section>
        )}

        {/* 测评版本历史 */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center gap-2">
            <History className="size-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">测评版本历史</h2>
            <span className="text-sm text-muted-foreground">（{history.length} 次）</span>
          </div>

          {history.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <History className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">暂无测评记录，完成一次评估后将自动记录。</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>智能体版本</TableHead>
                    <TableHead>测评模型</TableHead>
                    <TableHead>测评时间</TableHead>
                    <TableHead className="text-right">得分</TableHead>
                    <TableHead className="text-right">通过率</TableHead>
                    <TableHead className="text-right">用例数</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell>
                        <Badge variant="outline" className="gap-1 border-primary/30 text-primary">
                          <GitBranch className="size-3" />
                          {h.version}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{h.model}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDateTime(h.evaluatedAt)}</TableCell>
                      <TableCell className="text-right font-semibold text-foreground">{h.score}</TableCell>
                      <TableCell className="text-right text-foreground">{h.passRate}%</TableCell>
                      <TableCell className="text-right text-muted-foreground">{h.caseCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function MetricCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={
        "rounded-lg border p-4 " +
        (highlight ? "border-primary/30 bg-accent" : "border-border bg-secondary/30")
      }
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={"mt-1 text-2xl font-semibold " + (highlight ? "text-primary" : "text-foreground")}>{value}</p>
    </div>
  )
}
