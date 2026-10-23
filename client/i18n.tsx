import { useMemo } from "react";
import { useTranslation } from "@getpaseo/plugin/client";
import { messages } from "./messages";

export type { PluginMessage } from "@getpaseo/plugin/client";
export { messages };

export interface UIStrings {
  close: string;
  cancel: string;
  save: string;
  copy: string;
  copied: string;
  copyFailed: string;
  expand: string;
  collapse: string;
  expandAll: string;
  processing: string;

  connLive: string;
  connRestored: string;
  connError: string;
  connConnecting: string;

  statusRunning: string;
  statusIdle: string;
  statusInitializing: string;
  statusError: string;
  statusStopped: string;

  panelTitle: string;
  noThreads: string;
  moreSessions: string;
  openTab: string;
  willNewThreadShort: string;

  emptyTitle: string;
  emptyBody: string;
  emptyTranscript: string;
  thinking: string;
  stoppedThread: (reason: string) => string;
  stoppedThreadHint: string;

  inputPlaceholderContinue: string;
  inputPlaceholderNew: string;
  send: string;
  sending: string;
  stop: string;
  stopping: string;
  sentInterruptToast: string;
  willSendTo: (title: string) => string;
  willSwitchMode: (mode: string) => string;
  willSwitchModel: (model: string) => string;
  providerLocked: (provider: string) => string;
  willRebuild: string;
  willNewThreadChanged: string;
  willNewThread: string;
  jumpToBottom: string;
  feedbackIssue: string;
  linkOpenFailed: string;

  threadsSheet: string;
  searchThreads: string;
  noThreadMatches: string;
  currentBadge: string;
  rename: string;
  copyId: string;
  archive: string;
  closeTab: string;
  renameSheet: string;
  threadNamePlaceholder: string;
  modelsSheet: string;
  modelsSheetHint: string;
  searchModels: string;
  followMain: string;
  noModels: string;
  settingsFallbackHint: string;

  stoppedToast: string;
  archivedToast: string;
  archiveFailed: (error: string) => string;
  renamedToast: string;
  renameFailed: (error: string) => string;
  permissionFailed: (error: string) => string;
  stopIneffective: string;

  answering: string;
  answeringElapsed: (elapsed: string) => string;
  timePrefix: string;
  failedPrefix: (error: string) => string;
  canceled: string;

  permissionTitle: string;
  toolRequest: string;
  allow: string;
  deny: string;
  questionSubmit: string;
  questionClose: string;
  questionOther: string;
  questionPrev: string;
  questionNext: string;

  reasoningRunning: string;
  reasoning: string;
  toolRunning: string;
  toolCompleted: string;
  toolFailed: string;
  toolCanceled: string;
  compactionLoading: string;
  compactionDone: string;

  updateBannerTitle: string;
  updateBannerBody: (current: string, latest: string, paseo: string) => string;
  updateBannerDismiss: string;
}

/** 面板 / 条目文案：跟随宿主 App 语言。 */
export function useT(): UIStrings {
  const { t } = useTranslation(messages);
  return useMemo(
    () => ({
      close: t("close"),
      cancel: t("cancel"),
      save: t("save"),
      copy: t("copy"),
      copied: t("copied"),
      copyFailed: t("copyFailed"),
      expand: t("expand"),
      collapse: t("collapse"),
      expandAll: t("expandAll"),
      processing: t("processing"),

      connLive: t("connLive"),
      connRestored: t("connRestored"),
      connError: t("connError"),
      connConnecting: t("connConnecting"),

      statusRunning: t("statusRunning"),
      statusIdle: t("statusIdle"),
      statusInitializing: t("statusInitializing"),
      statusError: t("statusError"),
      statusStopped: t("statusStopped"),

      panelTitle: t("panelTitle"),
      noThreads: t("noThreads"),
      moreSessions: t("moreSessions"),
      openTab: t("openTab"),
      willNewThreadShort: t("willNewThreadShort"),

      emptyTitle: t("emptyTitle"),
      emptyBody: t("emptyBody"),
      emptyTranscript: t("emptyTranscript"),
      thinking: t("thinking"),
      stoppedThread: (reason: string) => t("stoppedThread", { reason }),
      stoppedThreadHint: t("stoppedThreadHint"),

      inputPlaceholderContinue: t("inputPlaceholderContinue"),
      inputPlaceholderNew: t("inputPlaceholderNew"),
      send: t("send"),
      sending: t("sending"),
      stop: t("stop"),
      stopping: t("stopping"),
      sentInterruptToast: t("sentInterruptToast"),
      willSendTo: (title: string) => t("willSendTo", { title }),
      willSwitchMode: (mode: string) => t("willSwitchMode", { mode }),
      willSwitchModel: (model: string) => t("willSwitchModel", { model }),
      providerLocked: (provider: string) => t("providerLocked", { provider }),
      willRebuild: t("willRebuild"),
      willNewThreadChanged: t("willNewThreadChanged"),
      willNewThread: t("willNewThread"),
      jumpToBottom: t("jumpToBottom"),
      feedbackIssue: t("feedbackIssue"),
      linkOpenFailed: t("linkOpenFailed"),

      threadsSheet: t("threadsSheet"),
      searchThreads: t("searchThreads"),
      noThreadMatches: t("noThreadMatches"),
      currentBadge: t("currentBadge"),
      rename: t("rename"),
      copyId: t("copyId"),
      archive: t("archive"),
      closeTab: t("closeTab"),
      renameSheet: t("renameSheet"),
      threadNamePlaceholder: t("threadNamePlaceholder"),
      modelsSheet: t("modelsSheet"),
      modelsSheetHint: t("modelsSheetHint"),
      searchModels: t("searchModels"),
      followMain: t("followMain"),
      noModels: t("noModels"),
      settingsFallbackHint: t("settingsFallbackHint"),

      stoppedToast: t("stoppedToast"),
      archivedToast: t("archivedToast"),
      archiveFailed: (error: string) => t("archiveFailed", { error }),
      renamedToast: t("renamedToast"),
      renameFailed: (error: string) => t("renameFailed", { error }),
      permissionFailed: (error: string) => t("permissionFailed", { error }),
      stopIneffective: t("stopIneffective"),

      answering: t("answering"),
      answeringElapsed: (elapsed: string) => t("answeringElapsed", { elapsed }),
      timePrefix: t("timePrefix"),
      failedPrefix: (error: string) => t("failedPrefix", { error }),
      canceled: t("canceled"),

      permissionTitle: t("permissionTitle"),
      toolRequest: t("toolRequest"),
      allow: t("allow"),
      deny: t("deny"),
      questionSubmit: t("questionSubmit"),
      questionClose: t("questionClose"),
      questionOther: t("questionOther"),
      questionPrev: t("questionPrev"),
      questionNext: t("questionNext"),

      reasoningRunning: t("reasoningRunning"),
      reasoning: t("reasoning"),
      toolRunning: t("toolRunning"),
      toolCompleted: t("toolCompleted"),
      toolFailed: t("toolFailed"),
      toolCanceled: t("toolCanceled"),
      compactionLoading: t("compactionLoading"),
      compactionDone: t("compactionDone"),

      updateBannerTitle: t("update.bannerTitle"),
      updateBannerBody: (current: string, latest: string, paseo: string) =>
        t("update.bannerBody", { current, latest, paseo }),
      updateBannerDismiss: t("update.bannerDismiss"),
    }),
    [t],
  );
}

/** 当前 App locale（如 zh-CN / en）。 */
export function useLocale(): string {
  return useTranslation(messages).locale;
}

/** Localize common daemon messages while preserving unknown errors verbatim. */
export function localizeServerMessage(messageText: string, locale: string): string {
  if (locale.toLowerCase().startsWith("zh")) return messageText;
  if (locale.toLowerCase().startsWith("ko")) {
    const normalized = messageText.toLowerCase();
    if (["已停止", "stopped"].includes(messageText)) return "중지됨";
    if (["已归档", "archived"].includes(messageText)) return "보관됨";
    if (["会话不存在", "session unavailable"].includes(messageText)) return "대화를 사용할 수 없음";
    if (["会话已归档或不存在", "archived or unavailable"].includes(messageText)) return "보관됐거나 사용할 수 없음";
    if (normalized.includes("this side thread has stopped") || messageText.includes("该侧聊已停止")) {
      return "이 보조 대화가 중지되었습니다. 다시 만들어 계속하거나 새 대화를 시작하세요.";
    }
    if (normalized.includes("concurrency limit reached") || messageText.includes("并发已达上限")) {
      return "동시 실행 제한에 도달했습니다. 실행 중인 보조 대화가 끝난 뒤 다시 시도하세요.";
    }
    if (normalized.includes("thread not found") || messageText.includes("线程不存在")) {
      return "대화를 찾을 수 없습니다.";
    }
    if (normalized.includes("side chat is not running") || messageText.includes("侧聊当前不在运行中")) {
      return "보조 대화가 실행 중이 아닙니다.";
    }
    if (normalized.includes("cancellation requested") || messageText.includes("已发起取消请求")) {
      return "취소를 요청했습니다. 5초 안에 중지되지 않으면 원래 탭에서 직접 중지하세요.";
    }
    if (normalized.includes("failed to request helper cancellation") || messageText.includes("辅助取消发起失败")) {
      return "취소를 요청하지 못했습니다.";
    }
    if (normalized.includes("cannot switch provider") || messageText.includes("不能切换 provider")) {
      return "기존 대화에서는 provider를 바꿀 수 없습니다. 다른 provider를 사용하려면 새 대화를 시작하세요.";
    }
    if (normalized.includes("model switch failed") || messageText.includes("模型切换失败")) {
      return "Model을 바꾸지 못했습니다. 다시 시도하거나 원하는 model로 새 대화를 시작하세요.";
    }
    if (normalized.includes("mode switch failed") || messageText.includes("模式切换失败") || messageText.includes("切换未生效")) {
      return "Mode를 바꾸지 못해 메시지를 보내지 않았습니다. 다시 시도하거나 원래 agent 탭에서 mode를 변경하세요.";
    }
    if (normalized.includes("paseo tools are unavailable") || messageText.includes("Paseo 工具不可用")) {
      return "이 host에서 Paseo 도구를 사용할 수 없습니다. daemon.mcp.injectIntoAgents를 활성화하세요.";
    }
    if (normalized.includes("main session is unavailable") || messageText.includes("主会话不存在")) {
      return "주 대화를 사용할 수 없습니다.";
    }
  }
  if (messageText.includes("该侧聊已停止")) {
    return "This side thread has stopped — rebuild it to continue, or start a new one.";
  }
  if (messageText.includes("并发已达上限")) {
    return "Concurrency limit reached — wait for running side chats to finish.";
  }
  if (messageText.includes("线程不存在")) return "Thread not found.";
  if (messageText.includes("侧聊当前不在运行中")) return "Side chat is not running.";
  if (messageText.includes("已发起取消请求")) {
    return "Cancellation requested (experimental). If it does not take effect in 5s, open the tab to stop.";
  }
  if (messageText.includes("辅助取消发起失败")) return "Failed to request cancellation.";
  if (messageText.includes("不能切换 provider")) {
    return "An existing side chat cannot switch provider — start a new thread to use another provider.";
  }
  if (messageText.includes("模型切换失败")) {
    return "Model switch failed — try again, or start a new thread with the desired model.";
  }
  if (messageText.includes("模式切换失败") || messageText.includes("切换未生效")) {
    return "Mode switch failed — the message was not sent. Try again, or switch the mode from the agent's native tab.";
  }
  if (messageText.includes("Paseo 工具不可用")) {
    return "Paseo tools are unavailable on this host (enable daemon.mcp.injectIntoAgents).";
  }
  if (messageText.includes("主会话不存在")) return "Main session is unavailable.";
  if (messageText === "已停止") return "Stopped";
  if (messageText === "已归档") return "Archived";
  if (messageText === "会话不存在") return "Session unavailable";
  if (messageText === "会话已归档或不存在") return "Archived or unavailable";
  return messageText;
}
