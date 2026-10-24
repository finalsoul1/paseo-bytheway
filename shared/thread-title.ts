const HAN_PATTERN = /\p{Script=Han}/u;
const HANGUL_PATTERN = /\p{Script=Hangul}/u;

export function containsHan(text: string): boolean {
  return HAN_PATTERN.test(text);
}

export function titleLanguageInstruction(locale: string | undefined): string {
  if (locale?.toLowerCase().startsWith("ko")) {
    return "Write the title in Korean Hangul. Keep necessary English technical terms, but do not use Chinese Han characters.";
  }
  if (locale?.toLowerCase().startsWith("zh")) {
    return "Write the title in Simplified Chinese.";
  }
  return "Use the same language as the question.";
}

export function normalizeGeneratedTitle(
  question: string,
  raw: string,
  locale: string | undefined,
): string | null {
  const title = raw
    .split("\n")[0]
    ?.trim()
    .replace(/^[\u201c\u201d"'\u300c\u300d\u3010\s]+|[\u201c\u201d"'\u300c\u300d\u3010\s]+$/g, "")
    .slice(0, 30);
  if (!title) return null;

  const requiresKorean = locale?.toLowerCase().startsWith("ko") || HANGUL_PATTERN.test(question);
  if (requiresKorean && (containsHan(title) || !HANGUL_PATTERN.test(title))) return null;
  return title;
}
