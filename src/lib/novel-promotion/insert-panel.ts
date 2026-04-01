const DEFAULT_INSERT_PANEL_USER_INPUT = {
  tr: 'Önceki ve sonraki kareleri otomatik olarak analiz edip doğal bir geçiş sağlayan yeni bir kare ekleyin.',
  en: 'Automatically analyze the surrounding panels and insert a naturally connected new panel.',
} as const

function readTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function isTrLocale(locale: string | undefined): boolean {
  return typeof locale === 'string' && locale.toLowerCase().startsWith('tr')
}

export function resolveInsertPanelUserInput(payload: Record<string, unknown>, locale?: string): string {
  const explicitInput = readTrimmedString(payload.userInput)
  if (explicitInput) return explicitInput

  const promptInput = readTrimmedString(payload.prompt)
  if (promptInput) return promptInput

  return isTrLocale(locale)
    ? DEFAULT_INSERT_PANEL_USER_INPUT.tr
    : DEFAULT_INSERT_PANEL_USER_INPUT.en
}
