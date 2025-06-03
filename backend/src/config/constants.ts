import path from 'node:path'

export const SUPPORTED_LANGUAGES = ['ru', 'en'] as const

export type SUPPORTED_LANGUAGES_TYPE = (typeof SUPPORTED_LANGUAGES)[number]

export const STORAGE_ROOT = path.resolve('storage')

export const STORAGE_PATHS = {
  import: path.join(STORAGE_ROOT, 'import'),
  export: path.join(STORAGE_ROOT, 'export'),
  temp: path.join(STORAGE_ROOT, 'temp'),
  importCategories: path.join(STORAGE_ROOT, 'import', 'categories'),
  exportCategories: path.join(STORAGE_ROOT, 'export', 'categories'),
}

export const PUBLIC_URL = `${process.env.BASE_URL || 'http://localhost:3000'}/storage`

export const PUBLIC_PATHS = {
  import: `${PUBLIC_URL}/import`,
  export: `${PUBLIC_URL}/export`,
  temp: `${PUBLIC_URL}/temp`,
  importCategories: `${PUBLIC_URL}/import/categories`,
  exportCategories: `${PUBLIC_URL}/export/categories`,
}
