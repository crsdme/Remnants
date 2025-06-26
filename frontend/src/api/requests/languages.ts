import type {
  batchLanguageParams,
  createLanguagesParams,
  duplicateLanguageParams,
  editLanguageParams,
  getLanguagesParams,
  importLanguagesParams,
  LanguagesResponse,
  removeLanguageParams,
} from '@/api/types'
import { api } from '@/api/instance'

export async function getLanguages(params: getLanguagesParams) {
  return api.get<LanguagesResponse>('languages/get', { params })
}

export async function createLanguage(params: createLanguagesParams) {
  return api.post<LanguagesResponse>('languages/create', { ...params })
}

export async function editLanguage(params: editLanguageParams) {
  return api.post<LanguagesResponse>('languages/edit', params)
}

export async function removeLanguage(params: removeLanguageParams) {
  return api.post<LanguagesResponse>('languages/remove', params)
}

export async function batchLanguage(params: batchLanguageParams) {
  return api.post<LanguagesResponse>('languages/batch', params)
}

export async function importLanguages(params: importLanguagesParams) {
  return api.post<LanguagesResponse>('languages/import', params, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export async function duplicateLanguage(params: duplicateLanguageParams) {
  return api.post<LanguagesResponse>('languages/duplicate', params)
}
