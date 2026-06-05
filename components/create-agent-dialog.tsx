"use client"

import { Bot, Plus, MessageSquareText, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CreateAgentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectConfig: () => void
  onSelectNL2Agent: () => void
}

export function CreateAgentDialog({
  open,
  onOpenChange,
  onSelectConfig,
  onSelectNL2Agent,
}: CreateAgentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Plus className="size-4" />
            </div>
            创建新的智能体
          </DialogTitle>
          <DialogDescription>
            选择你偏好的创建方式，开始构建智能体
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 grid gap-4">
          {/* 配置方式 */}
          <button
            onClick={() => {
              onOpenChange(false)
              onSelectConfig()
            }}
            className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Settings2 className="size-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">通过配置创建</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                使用表单逐步配置智能体的名称、工具、提示词等属性，适合对智能体配置有明确想法的用户。
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">精确控制</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">逐项配置</span>
              </div>
            </div>
          </button>

          {/* NL2Agent 方式 */}
          <button
            onClick={() => {
              onOpenChange(false)
              onSelectNL2Agent()
            }}
            className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
              <MessageSquareText className="size-6" />
            </div>
            <div className="flex-1">
              <h3 className="flex items-center gap-2 font-medium text-foreground">
                通过对话创建
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">NL2Agent</span>
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                通过自然语言描述需求，AI 会主动追问并智能匹配工具、生成提示词，适合快速创建或不确定具体配置的用户。
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">自然语言</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">智能推荐</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">多轮对话</span>
              </div>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
