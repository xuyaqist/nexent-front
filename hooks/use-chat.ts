"use client"

import { useCallback, useRef, useState } from "react"
import type {
  AgentId,
  ChatMessage,
  ContextItem,
  Conversation,
  HitlPart,
  MessagePart,
  PlanPart,
  PlanStep,
} from "@/lib/types"
import { INITIAL_CONVERSATIONS, getAgent } from "@/lib/mock-data"
import { buildScenario, delay, type Scenario } from "@/lib/mock-engine"

let idSeq = 0
const uid = (prefix: string) => `${prefix}-${Date.now()}-${idSeq++}`

/** thrown internally to unwind a streaming run that was aborted */
const ABORT = Symbol("abort")

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  // monotonically increasing token; bumping it aborts any in-flight run
  const runToken = useRef(0)
  // resolver for the HITL gate; non-null means we're awaiting a human decision
  const hitlGate = useRef<((approved: boolean) => void) | null>(null)
  const [awaitingHitl, setAwaitingHitl] = useState(false)

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null

  // ---- helpers ----------------------------------------------------------
  const patchConversation = useCallback(
    (convId: string, updater: (c: Conversation) => Conversation) => {
      setConversations((prev) => prev.map((c) => (c.id === convId ? updater(c) : c)))
    },
    [],
  )

  const patchMessage = useCallback(
    (convId: string, msgId: string, updater: (m: ChatMessage) => ChatMessage) => {
      patchConversation(convId, (c) => ({
        ...c,
        messages: c.messages.map((m) => (m.id === msgId ? updater(m) : m)),
      }))
    },
    [patchConversation],
  )

  const setMessageParts = useCallback(
    (convId: string, msgId: string, parts: MessagePart[]) => {
      patchMessage(convId, msgId, (m) => ({ ...m, parts: [...parts] }))
    },
    [patchMessage],
  )

  // ---- conversation management -----------------------------------------
  const newConversation = useCallback(() => {
    runToken.current++ // abort anything in-flight
    setIsStreaming(false)
    const id = uid("conv")
    const conv: Conversation = {
      id,
      title: "新对话",
      agentId: null,
      messages: [],
      updatedAt: Date.now(),
      taskStatus: "idle",
    }
    setConversations((prev) => [conv, ...prev])
    setActiveId(id)
  }, [])

  const selectConversation = useCallback((id: string) => {
    runToken.current++
    setIsStreaming(false)
    setActiveId(id)
  }, [])

  const setActiveAgent = useCallback(
    (agentId: AgentId) => {
      if (!activeId) {
        const id = uid("conv")
        const conv: Conversation = {
          id,
          title: "新对话",
          agentId,
          messages: [],
          updatedAt: Date.now(),
          taskStatus: "idle",
        }
        setConversations((prev) => [conv, ...prev])
        setActiveId(id)
        return
      }
      patchConversation(activeId, (c) => ({ ...c, agentId, suggestions: undefined }))
    },
    [activeId, patchConversation],
  )

  // ---- HITL resolution --------------------------------------------------
  const resolveHitl = useCallback(
    (convId: string, msgId: string, approved: boolean) => {
      patchMessage(convId, msgId, (m) => ({
        ...m,
        parts: m.parts.map((p) =>
          p.type === "hitl" ? ({ ...(p as HitlPart), status: approved ? "approved" : "rejected" }) : p,
        ),
      }))
      const gate = hitlGate.current
      hitlGate.current = null
      setAwaitingHitl(false)
      gate?.(approved)
    },
    [patchMessage],
  )

  // ---- stop the current run --------------------------------------------
  const stop = useCallback(() => {
    runToken.current++
    setIsStreaming(false)
    setAwaitingHitl(false)
    hitlGate.current = null
    if (activeId) {
      patchConversation(activeId, (c) => ({
        ...c,
        taskStatus: "stopped",
        messages: c.messages.map((m) => (m.streaming ? { ...m, streaming: false } : m)),
        plan: c.plan
          ? {
              ...c.plan,
              // freeze any in-progress step as pending again to signal interruption
              steps: c.plan.steps.map((s) => (s.status === "in_progress" ? { ...s, status: "pending" } : s)),
            }
          : c.plan,
      }))
    }
  }, [activeId, patchConversation])

  // ---- streaming a turn -------------------------------------------------
  const sendMessage = useCallback(
    async (text: string, agentId: AgentId) => {
      const trimmed = text.trim()
      if (!trimmed) return

      // interrupt any in-flight run, then start a fresh one
      runToken.current++
      hitlGate.current = null
      setAwaitingHitl(false)
      const myToken = runToken.current

      // ensure we have an active conversation
      let convId = activeId
      if (!convId) {
        convId = uid("conv")
        const conv: Conversation = {
          id: convId,
          title: trimmed.slice(0, 16),
          agentId,
          messages: [],
          updatedAt: Date.now(),
          taskStatus: "idle",
        }
        setConversations((prev) => [conv, ...prev])
        setActiveId(convId)
      }
      const cid = convId
      const agent = getAgent(agentId)

      // guard: throws if this run has been superseded/aborted
      const tick = async (ms: number) => {
        await delay(ms)
        if (runToken.current !== myToken) throw ABORT
      }

      const userMsg: ChatMessage = {
        id: uid("u"),
        role: "user",
        parts: [{ type: "text", text: trimmed }],
        createdAt: Date.now(),
      }
      const assistantMsg: ChatMessage = {
        id: uid("a"),
        role: "assistant",
        agentId,
        parts: [],
        createdAt: Date.now(),
        streaming: true,
      }

      const scenario = buildScenario(agentId, trimmed)

      // fresh plan: reset all steps so progression starts from zero
      const planSteps: PlanStep[] = (scenario.plan?.steps ?? []).map((s) => ({ ...s, status: "pending" }))
      const planMeta: PlanPart | undefined = scenario.plan
        ? { ...scenario.plan, steps: planSteps }
        : undefined

      // build the context-display items for this turn
      const baseContext: ContextItem[] = [
        { id: uid("ctx"), kind: "agent", label: "当前智能体", value: agent?.name ?? "智能体" },
        { id: uid("ctx"), kind: "request", label: "本轮请求", value: trimmed },
        ...scenario.tools.map((t) => ({ id: uid("ctx"), kind: "tool" as const, label: "工具", value: t.name })),
        ...(scenario.sources ?? []).map((s) => ({ id: uid("ctx"), kind: "source" as const, label: "来源", value: s })),
      ]

      patchConversation(cid, (c) => ({
        ...c,
        title: c.messages.length === 0 ? trimmed.slice(0, 16) : c.title,
        agentId,
        suggestions: undefined,
        updatedAt: Date.now(),
        taskStatus: "running",
        plan: planMeta,
        context: baseContext,
        messages: [...c.messages, userMsg, assistantMsg],
      }))

      setIsStreaming(true)
      const aId = assistantMsg.id
      const parts: MessagePart[] = []

      // local plan progression helpers (write to conversation level) ------
      let prog = 0
      const writePlan = () => {
        if (!planMeta) return
        const steps = planSteps.map((s, i) => ({
          ...s,
          status: i < prog ? ("done" as const) : i === prog ? ("in_progress" as const) : ("pending" as const),
        }))
        patchConversation(cid, (c) => ({ ...c, plan: { ...planMeta, steps } }))
      }
      const bumpPlan = () => {
        if (!planMeta) return
        prog = Math.min(prog + 1, planSteps.length - 1)
        writePlan()
      }
      const finishPlan = () => {
        if (!planMeta) return
        patchConversation(cid, (c) => ({
          ...c,
          plan: { ...planMeta, steps: planSteps.map((s) => ({ ...s, status: "done" as const })) },
        }))
      }
      const setStatus = (status: Conversation["taskStatus"]) =>
        patchConversation(cid, (c) => ({ ...c, taskStatus: status }))

      const streamText = async (full: string) => {
        const idx = parts.length - 1
        const chunk = 3
        for (let i = 0; i <= full.length; i += chunk) {
          ;(parts[idx] as { text: string }).text = full.slice(0, i)
          setMessageParts(cid, aId, parts)
          await tick(16)
        }
        ;(parts[idx] as { text: string }).text = full
        setMessageParts(cid, aId, parts)
      }

      try {
        // 1) reasoning (thinking chain)
        parts.push({ type: "reasoning", text: "" })
        await streamText(scenario.reasoning)
        await tick(250)

        // 2) start strategic plan (step 0 in progress)
        writePlan()
        await tick(400)

        // 3) tool calls — each completion advances the plan
        for (const tool of scenario.tools) {
          parts.push({ ...tool, status: "running", output: "" })
          setMessageParts(cid, aId, parts)
          await tick(700)
          parts[parts.length - 1] = { ...tool, status: "done" }
          setMessageParts(cid, aId, parts)
          bumpPlan()
          await tick(300)
        }

        // 4) human in the loop — pause for approval
        if (scenario.hitl) {
          parts.push({ ...scenario.hitl, status: "pending" })
          setMessageParts(cid, aId, parts)
          setAwaitingHitl(true)
          setStatus("awaiting")
          const approved = await new Promise<boolean>((resolve) => {
            hitlGate.current = resolve
          })
          if (runToken.current !== myToken) throw ABORT
          setStatus("running")
          const hitlIdx = parts.findIndex((p) => p.type === "hitl")
          if (hitlIdx >= 0) {
            parts[hitlIdx] = { ...(parts[hitlIdx] as HitlPart), status: approved ? "approved" : "rejected" }
          }
          if (!approved) {
            parts.push({ type: "text", text: "好的，已取消该操作。如果需要，我可以换一种方式继续。" })
            setMessageParts(cid, aId, parts)
            patchMessage(cid, aId, (m) => ({
              ...m,
              streaming: false,
              usage: { prompt: scenario.usage.prompt, completion: 28, total: scenario.usage.prompt + 28 },
            }))
            setStatus("done")
            setIsStreaming(false)
            return
          }
          bumpPlan()
          await tick(300)
        }

        // 5) final answer
        parts.push({ type: "text", text: "" })
        await streamText(scenario.answer)

        // 6) finalize: complete plan + usage + suggestions
        finishPlan()
        patchMessage(cid, aId, (m) => ({ ...m, streaming: false, usage: scenario.usage }))
        patchConversation(cid, (c) => ({
          ...c,
          suggestions: scenario.suggestions,
          taskStatus: "done",
          updatedAt: Date.now(),
        }))
        setIsStreaming(false)
      } catch (e) {
        if (e !== ABORT) throw e
        // aborted: stop() already updated state; nothing else to do
      }
    },
    [activeId, patchConversation, patchMessage, setMessageParts],
  )

  return {
    conversations,
    activeConversation,
    activeId,
    isStreaming,
    awaitingHitl,
    newConversation,
    selectConversation,
    setActiveAgent,
    sendMessage,
    resolveHitl,
    stop,
  }
}

export type { Scenario }
