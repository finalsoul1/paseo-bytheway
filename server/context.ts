import type { PluginHandlerContext } from "@getpaseo/plugin/server";
import { PROMPT_MARKERS } from "../shared/prompt-markers";
import type { ThreadMode } from "../shared/types";

export type PaseoApi = PluginHandlerContext["paseo"];
type AgentHandle = ReturnType<PaseoApi["agents"]["ref"]>;
type TimelinePage = Awaited<ReturnType<AgentHandle["timeline"]["refetch"]>>;
export type TimelineEntry = TimelinePage["entries"][number];
export type TimelineItem = TimelineEntry["item"];

/* ------------------------------------------------------------------ */
/* 转录线性化（消息 + 工具动作）                                          */
/* ------------------------------------------------------------------ */

export type ToolTier = "change" | "info" | "minor";

export interface TranscriptUnit {
  kind: "user" | "assistant" | "tool";
  /** 消息：原文（未截断）；工具：摘要行（已按分级截断）。 */
  text: string;
  tier?: ToolTier;
}

export interface TranscriptTail {
  units: TranscriptUnit[];
  messagesSeen: number;
  /** 尾部页已触及 limit，无法保证游标可靠。 */
  unreliable: boolean;
}

const MAX_CHARS_PER_MESSAGE = 1500;
export const SNAPSHOT_BUDGET = 8000;
export const DIGEST_BUDGET = 2000;
export const PASSIVE_SNAPSHOT_MESSAGES = 12;
export const PASSIVE_SNAPSHOT_BUDGET = 12000;
export const INCREMENT_MESSAGES = 3;
export const INCREMENT_BUDGET = 3000;

function truncate(text: string, max: number): string {
  const clean = text.trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max)}…`;
}

function diffStat(unifiedDiff: string | undefined): { stat: string; hunk: string } {
  if (!unifiedDiff) return { stat: "", hunk: "" };
  let plus = 0;
  let minus = 0;
  let hunk = "";
  for (const line of unifiedDiff.split("\n")) {
    if (line.startsWith("+++") || line.startsWith("---")) continue;
    if (line.startsWith("+")) plus += 1;
    else if (line.startsWith("-")) minus += 1;
    else if (!hunk && line.startsWith("@@")) hunk = line.slice(0, 80);
  }
  const stat = plus || minus ? ` +${plus}/-${minus}` : "";
  return { stat, hunk };
}

const CHANGE_SHELL_RE =
  /(^|\s|\||;|&&)(rm|mv|cp|mkdir|touch|chmod|chown|kill|pkill|git\s+(commit|push|merge|rebase|reset|checkout|switch|add)|npm\s+(install|i|publish|uninstall)|pnpm|yarn|cargo|go\s+(build|test|run)|make|docker|kubectl|curl|wget|ssh|scp|git\s+stash)/i;

function toolUnit(item: Extract<TimelineItem, { type: "tool_call" }>): TranscriptUnit {
  const failed = item.status === "failed" ? " (failed)" : item.status === "canceled" ? " (canceled)" : "";
  const detail = item.detail;
  let line: string;
  let tier: ToolTier = "minor";

  switch (detail.type) {
    case "edit": {
      const { stat, hunk } = diffStat(detail.unifiedDiff);
      line = `- [edit] ${detail.filePath}${stat}${hunk ? ` ${hunk}` : ""}${failed}`;
      tier = "change";
      break;
    }
    case "write": {
      line = `- [write] ${detail.filePath}${failed}`;
      tier = "change";
      break;
    }
    case "shell": {
      const change = CHANGE_SHELL_RE.test(detail.command);
      line = `- [shell] ${detail.command}${failed}`;
      tier = change ? "change" : "info";
      break;
    }
    case "read": {
      line = `- [read] ${detail.filePath}${failed}`;
      tier = "info";
      break;
    }
    case "search": {
      line = `- [search] ${detail.query}${detail.content ? " (results found)" : ""}${failed}`;
      tier = "info";
      break;
    }
    default: {
      line = `- [${item.name}]${failed}`;
      tier = "minor";
      break;
    }
  }

  const cap = tier === "change" ? 200 : tier === "info" ? 150 : 30;
  return { kind: "tool", text: truncate(line, cap), tier };
}

/** 读取主会话转录尾部并线性化为「消息 + 工具动作」序列。 */
export async function fetchTranscriptTail(
  paseo: PaseoApi,
  agentId: string,
  limit = 100,
): Promise<TranscriptTail> {
  const page = await paseo.agents.ref(agentId).timeline.refetch({ direction: "tail", limit });
  const units: TranscriptUnit[] = [];
  let messagesSeen = 0;
  for (const entry of page.entries) {
    const item = entry.item;
    if (item.type === "user_message") {
      units.push({ kind: "user", text: item.text });
      messagesSeen += 1;
    } else if (item.type === "assistant_message") {
      units.push({ kind: "assistant", text: item.text });
      messagesSeen += 1;
    } else if (item.type === "tool_call") {
      units.push(toolUnit(item));
    }
  }
  return { units, messagesSeen, unreliable: page.entries.length >= limit };
}

/* ------------------------------------------------------------------ */
/* 文本构建                                                             */
/* ------------------------------------------------------------------ */

const TIER_PRIORITY: Record<ToolTier, number> = { change: 0, info: 1, minor: 2 };

export function buildDigestLines(
  units: TranscriptUnit[],
  budget = DIGEST_BUDGET,
): string[] {
  const tools = units.filter((unit) => unit.kind === "tool");
  // 最近的动作优先（同优先级内），再按分级排序，最后按预算装配
  const indexed = tools.map((unit, index) => ({ unit, index }));
  indexed.sort((a, b) => {
    const tierDelta = TIER_PRIORITY[a.unit.tier ?? "minor"] - TIER_PRIORITY[b.unit.tier ?? "minor"];
    if (tierDelta !== 0) return tierDelta;
    return b.index - a.index;
  });
  const kept: Array<{ text: string; index: number }> = [];
  let used = 0;
  for (const { unit, index } of indexed) {
    const cost = unit.text.length + 1;
    if (used + cost > budget) continue;
    used += cost;
    kept.push({ text: unit.text, index });
  }
  kept.sort((a, b) => a.index - b.index);
  return kept.map((entry) => entry.text);
}

export function buildSnapshotText(
  tail: TranscriptTail,
  options: { messages: number; includeDigest: boolean; budget?: number; passive?: boolean },
): string {
  const budget = options.budget ?? SNAPSHOT_BUDGET;
  const messageUnits = tail.units.filter((unit) => unit.kind !== "tool");
  const recent = messageUnits.slice(-Math.max(0, options.messages));
  const lines: string[] = [];
  let used = 0;
  for (let i = recent.length - 1; i >= 0; i -= 1) {
    const unit = recent[i];
    const role = unit.kind === "user" ? "User" : "Assistant";
    const rendered = `${role}: ${truncate(unit.text, MAX_CHARS_PER_MESSAGE)}`;
    if (used + rendered.length > budget && lines.length > 0) break;
    used += rendered.length;
    lines.unshift(rendered);
  }

  const digestLines = options.includeDigest ? buildDigestLines(tail.units) : [];
  const parts: string[] = [
    `${PROMPT_MARKERS.mainSnapshot} (generated at ${new Date().toISOString()}). ${
      options.passive
        ? "This thread uses passive sync. New main-session activity will be attached to later messages."
        : "Use get_agent_activity when you need the latest activity from the main session."
    }`,
  ];
  if (lines.length > 0) parts.push(`### Recent messages\n${lines.join("\n\n")}`);
  if (digestLines.length > 0) parts.push(`### Recent actions\n${digestLines.join("\n")}`);
  if (lines.length === 0 && digestLines.length === 0) parts.push("No main-session history is available. Answer from the user's question.");
  return parts.join("\n\n");
}

export interface SyncCursor {
  unitsSeen: number;
  messagesSeen: number;
}

export interface IncrementResult {
  text: string;
  cursor: SyncCursor;
}

/** 被动同步模式：构建「主会话增量更新」。返回 null 表示没有新内容。 */
export function buildIncrementText(
  tail: TranscriptTail,
  cursor: SyncCursor | null,
  includeDigest: boolean,
): IncrementResult | null {
  const start = cursor?.unitsSeen ?? 0;
  if (start >= tail.units.length) return null;
  const fresh = tail.units.slice(start);
  const freshMessages = fresh.filter((unit) => unit.kind !== "tool").slice(-INCREMENT_MESSAGES);
  const digestLines = includeDigest ? buildDigestLines(fresh, 800) : [];
  if (freshMessages.length === 0 && digestLines.length === 0) return null;

  const lines: string[] = [];
  let used = 0;
  for (let i = freshMessages.length - 1; i >= 0; i -= 1) {
    const unit = freshMessages[i];
    const role = unit.kind === "user" ? "User" : "Assistant";
    const rendered = `${role}: ${truncate(unit.text, 1000)}`;
    if (used + rendered.length > INCREMENT_BUDGET && lines.length > 0) break;
    used += rendered.length;
    lines.unshift(rendered);
  }
  const parts = [`${PROMPT_MARKERS.mainIncrement} (generated at ${new Date().toISOString()}).`];
  if (lines.length > 0) parts.push(lines.join("\n\n"));
  if (digestLines.length > 0) parts.push(`### New actions\n${digestLines.join("\n")}`);
  return {
    text: parts.join("\n\n"),
    cursor: { unitsSeen: tail.units.length, messagesSeen: tail.messagesSeen },
  };
}

/* ------------------------------------------------------------------ */
/* 系统提示词                                                            */
/* ------------------------------------------------------------------ */

export interface SystemPromptOptions {
  mainAgentId: string;
  mode: ThreadMode;
  toolsAvailable: boolean;
  passive: boolean;
}

export function buildSystemPrompt(options: SystemPromptOptions): string {
  const { mainAgentId, mode, toolsAvailable, passive } = options;
  const contextLine = toolsAvailable
    ? `The main session agent id is ${mainAgentId}. Use the get_agent_activity MCP tool with this id when you need its latest activity, and get_agent_status when you need its state. Do not guess the main session's content.`
    : passive
      ? "The system provides main-session context as attachments through passive sync. Treat the latest attachment as authoritative."
      : "If main-session information is missing, say so instead of guessing.";
  const modeLine =
    mode === "ask"
      ? "You are in read-only advice mode. Do not modify files or run commands with side effects. You may read files and search to provide an accurate answer."
      : "You may perform the actions needed for the task. Keep changes minimal and focused, and avoid unrelated refactoring.";
  return [
    "You are a Paseo ByTheWay side session. The user asks a question or assigns a small task alongside their main session. Your answer is shown to the user and is not written into the main session automatically.",
    contextLine,
    modeLine,
    "Keep the answer focused, concise, and clear. Use the same language as the user's question.",
  ].join("\n");
}

/* ------------------------------------------------------------------ */
/* 主会话 agent 配置继承                                                  */
/* ------------------------------------------------------------------ */

type AgentFeatureLike = { id: string; value?: boolean | string | null };

/** 提取主会话快照 features（toggle/select）的值，供 create 时 featureValues 继承；跳过未设置的项。 */
export function featuresToValues(
  features: readonly AgentFeatureLike[] | null | undefined,
): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const feature of features ?? []) {
    if (feature.value === null || feature.value === undefined) continue;
    values[feature.id] = feature.value;
  }
  return values;
}

/* ------------------------------------------------------------------ */
/* 能力探测                                                              */
/* ------------------------------------------------------------------ */

let toolsCache: { value: boolean; at: number } | null = null;

/** 探测 Paseo 工具注入是否开启（60 秒缓存）。 */
export async function detectToolsAvailable(paseo: PaseoApi): Promise<boolean> {
  if (toolsCache && Date.now() - toolsCache.at < 60_000) return toolsCache.value;
  try {
    const { config } = await paseo.config.get();
    const injected =
      (config as { daemon?: { mcp?: { injectIntoAgents?: boolean } } }).daemon?.mcp
        ?.injectIntoAgents === true;
    toolsCache = { value: injected, at: Date.now() };
    return injected;
  } catch {
    return toolsCache?.value ?? true;
  }
}

/** 选择 provider 的只读 / 计划模式。 */
export async function pickReadOnlyMode(paseo: PaseoApi, provider: string): Promise<string | undefined> {
  try {
    const result = await paseo.providers.listModes(provider);
    const modes = result.modes ?? [];
    const plan = modes.find((mode) => /plan|read/i.test(mode.id) || /plan|read/i.test(mode.label));
    return plan?.id;
  } catch {
    return undefined;
  }
}

function isPlanMode(mode: { id: string; label: string }): boolean {
  return /plan|read/i.test(mode.id) || /plan|read/i.test(mode.label);
}

/** 选择 provider 的执行（非 plan/read）模式；无匹配时返回 undefined（provider 默认）。 */
export async function pickBuildMode(paseo: PaseoApi, provider: string): Promise<string | undefined> {
  try {
    const result = await paseo.providers.listModes(provider);
    const modes = result.modes ?? [];
    const build =
      modes.find((mode) => /build|code|exec/i.test(mode.id) || /build|code|exec/i.test(mode.label)) ??
      modes.find((mode) => !isPlanMode(mode));
    return build?.id;
  } catch {
    return undefined;
  }
}
