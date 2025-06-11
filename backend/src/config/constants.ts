import path from 'node:path'

export const SUPPORTED_LANGUAGES = ['ru', 'en'] as const

export type SUPPORTED_LANGUAGES_TYPE = (typeof SUPPORTED_LANGUAGES)[number]

export const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:3001'

export const STORAGE_PATH = path.resolve('storage')

export const STORAGE_URL = `${BACKEND_URL}/storage`

export const STORAGE_PATHS = {
  import: path.join(STORAGE_PATH, 'import'),
  export: path.join(STORAGE_PATH, 'export'),
  temp: path.join(STORAGE_PATH, 'temp'),
  importCategories: path.join(STORAGE_PATH, 'import', 'categories'),
  exportCategories: path.join(STORAGE_PATH, 'export', 'categories'),
  importProducts: path.join(STORAGE_PATH, 'import', 'products'),
  exportProducts: path.join(STORAGE_PATH, 'export', 'products'),
  productImages: path.join(STORAGE_PATH, 'products', 'images'),
}

export const STORAGE_URLS = {
  import: `${STORAGE_URL}/import`,
  export: `${STORAGE_URL}/export`,
  temp: `${STORAGE_URL}/temp`,
  importCategories: `${STORAGE_URL}/import/categories`,
  exportCategories: `${STORAGE_URL}/export/categories`,
  importProducts: `${STORAGE_URL}/import/products`,
  exportProducts: `${STORAGE_URL}/export/products`,
  productImages: `${STORAGE_URL}/products/images`,
}
