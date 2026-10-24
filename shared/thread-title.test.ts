import { describe, expect, it } from "vitest";
import { containsHan, normalizeGeneratedTitle, titleLanguageInstruction } from "./thread-title";

describe("thread title localization", () => {
  it("rejects Chinese titles for a Korean locale", () => {
    expect(normalizeGeneratedTitle("하이", "韩语问候", "ko")).toBeNull();
  });

  it("accepts Korean titles for a Korean locale", () => {
    expect(normalizeGeneratedTitle("하이", "한국어 인사", "ko-KR")).toBe("한국어 인사");
  });

  it("uses the Korean question as a safeguard when locale is missing", () => {
    expect(normalizeGeneratedTitle("오류 원인 알려줘", "错误原因", undefined)).toBeNull();
  });

  it("allows Chinese titles for a Chinese locale", () => {
    expect(normalizeGeneratedTitle("你好", "问候", "zh-CN")).toBe("问候");
  });

  it("builds an explicit Korean instruction", () => {
    expect(titleLanguageInstruction("ko-KR")).toContain("do not use Chinese Han characters");
  });

  it("detects Han characters in legacy labels", () => {
    expect(containsHan("韩语问候")).toBe(true);
    expect(containsHan("한국어 인사")).toBe(false);
  });
});
