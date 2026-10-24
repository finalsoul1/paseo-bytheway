export function titleLanguageInstruction(locale: string | undefined): string {
  if (locale?.toLowerCase().startsWith("ko")) {
    return "Write the title in Korean Hangul. Keep necessary English technical terms, but do not use Chinese Han characters.";
  }
  if (locale?.toLowerCase().startsWith("zh")) {
    return "Write the title in Simplified Chinese.";
  }
  return "Use the same language as the question.";
}
