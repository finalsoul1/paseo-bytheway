import { PROMPT_MARKERS } from "../../shared/prompt-markers";
import type { RawItem } from "./types";

/** Internal context blocks that may be appended after the user's prompt. */
const CONTEXT_MARKERS = [
  PROMPT_MARKERS.mainSnapshot,
  PROMPT_MARKERS.mainIncrement,
  PROMPT_MARKERS.previousThreadSummary,
  PROMPT_MARKERS.rebuiltThreadSummary,
  "以下为主会话的最近上下文快照",
  "以下为主会话的新进展",
  "以下为前一条侧聊线程的历史摘要",
  "以下为该侧聊线程被重建前的历史摘要",
];

const WRAPPERS = [
  { prefix: PROMPT_MARKERS.continuationPrefix, questionMarker: PROMPT_MARKERS.continuationQuestion },
  { prefix: PROMPT_MARKERS.rebuildPrefix, questionMarker: PROMPT_MARKERS.rebuildQuestion },
  { prefix: "这是一条接续的侧聊线程", questionMarker: "然后处理：" },
  { prefix: "这是一条被重建的侧聊线程", questionMarker: "然后继续处理：" },
];

const EMPTY_REBUILD_QUESTIONS = new Set<string>([
  PROMPT_MARKERS.emptyRebuildSummary,
  PROMPT_MARKERS.emptyRebuildWait,
  "（请简短总结此前的结论，然后等待用户的下一个问题。）",
  "（请等待用户的下一个问题。）",
]);

/** Compare prompt text without treating formatting whitespace as meaningful. */
export function normalizePrompt(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Paseo represents the initial side-agent prompt as the first `agent_message`
 * tool call. Its detail text starts with the user's prompt and may append a
 * context snapshot or a continuation/rebuild wrapper.
 */
export function extractInitialPrompt(item: unknown): string | null {
  if (!item || typeof item !== "object") return null;
  const raw = item as Partial<RawItem>;
  if (raw.type !== "tool_call" || raw.name !== "agent_message") return null;
  const detail = raw.detail;
  if (!detail || detail.type !== "plain_text" || typeof detail.text !== "string") return null;

  const full = detail.text.replace(/\r\n?/g, "\n");
  let cut = full.length;
  for (const marker of CONTEXT_MARKERS) {
    const index = full.indexOf(marker);
    if (index >= 0) cut = Math.min(cut, index);
  }

  let prompt = full.slice(0, cut).trim();
  for (const wrapper of WRAPPERS) {
    if (!prompt.startsWith(wrapper.prefix)) continue;
    const index = prompt.indexOf(wrapper.questionMarker);
    if (index >= 0) {
      prompt = prompt.slice(index + wrapper.questionMarker.length).trim();
    } else {
      // Passive rebuild uses the wrapper prefix followed by the question.
      prompt = prompt.slice(wrapper.prefix.length).replace(/^[\s。.!！]+/, "").trim();
    }
    break;
  }

  if (!prompt || EMPTY_REBUILD_QUESTIONS.has(prompt)) return null;
  return prompt;
}

export interface PromptTimelinePage {
  entries: Array<{ item: RawItem | unknown }>;
  hasOlder: boolean;
  startCursor: unknown;
}

/** Walk backwards through timeline pages until the initial prompt is found. */
export async function findInitialPromptInPages(
  firstPage: PromptTimelinePage,
  fetchBefore: (cursor: unknown) => Promise<PromptTimelinePage>,
): Promise<string | null> {
  let page = firstPage;
  const seenCursors = new Set<string>();
  for (;;) {
    for (const entry of page.entries) {
      const prompt = extractInitialPrompt(entry.item);
      if (prompt) return prompt;
    }
    if (!page.hasOlder || page.startCursor == null) return null;
    const cursorKey = JSON.stringify(page.startCursor);
    if (seenCursors.has(cursorKey)) return null;
    seenCursors.add(cursorKey);
    page = await fetchBefore(page.startCursor);
  }
}
