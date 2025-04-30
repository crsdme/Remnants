export const SUPPORTED_LANGUAGES = ['ru', 'en', 'fr', 'de'] as const

export type SUPPORTED_LANGUAGES_TYPE = (typeof SUPPORTED_LANGUAGES)[number]
