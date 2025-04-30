export const backendUrl = 'http://127.0.0.1:3001/'

export const SUPPORTED_LANGUAGES = ['ru', 'en', 'fr', 'de'] as const
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]
