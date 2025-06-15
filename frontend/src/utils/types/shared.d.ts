import type { SupportedLanguage } from '../constants'

type LanguageFields = {
  [key in SupportedLanguage]: string
}

declare global {
  interface LanguageString extends LanguageFields {}

  interface Pagination {
    current: number
    pageSize: number
  }
}

export {}
