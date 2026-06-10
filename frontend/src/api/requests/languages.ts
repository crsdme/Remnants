import type {
  CreateLanguageRequest,
  CreateLanguageResponse,
  EditLanguageRequest,
  EditLanguageResponse,
  GetLanguageResponse,
  GetLanguagesRequest,
  RemoveLanguageRequest,
  RemoveLanguageResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function getLanguages(params: GetLanguagesRequest) {
  return api.get<GetLanguageResponse>('languages/get', { params })
}

export async function createLanguage(params: CreateLanguageRequest) {
  return api.post<CreateLanguageResponse>('languages/create', { ...params })
}

export async function editLanguage(params: EditLanguageRequest) {
  return api.post<EditLanguageResponse>('languages/edit', params)
}

export async function removeLanguage(params: RemoveLanguageRequest) {
  return api.post<RemoveLanguageResponse>('languages/remove', params)
}
