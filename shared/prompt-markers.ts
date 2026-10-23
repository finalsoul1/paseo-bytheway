/** Internal prompt-wrapper markers shared by the daemon-side prompt builder and client renderer. */
export const PROMPT_MARKERS = {
  mainSnapshot: "Recent context snapshot from the main session",
  mainIncrement: "New activity from the main session",
  previousThreadSummary: "Summary of the previous side thread",
  rebuiltThreadSummary: "Summary from before this side thread was rebuilt",
  continuationPrefix: "This side thread continues an earlier thread",
  continuationQuestion: "Then handle this request:",
  rebuildPrefix: "This side thread was rebuilt",
  rebuildQuestion: "Then continue with this request:",
  emptyRebuildSummary: "Briefly summarize the earlier conclusions, then wait for the user's next question.",
  emptyRebuildWait: "Wait for the user's next question.",
} as const;
