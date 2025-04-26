import { api } from '@/api/instance'

export interface getLanguagesParams {
  // filters: {
  //   current: number;
  //   pageSize: number;
  // };
  // sorters: {
  //   current: number;
  //   pageSize: number;
  // };
  pagination: {
    full: boolean
    current?: number
    pageSize?: number
  }
}

export async function getLanguages(params: getLanguagesParams) {
  return api.get<LanguagesResponse>('languages/get', { params })
}

export type createLanguagesParams = Language

export async function createLanguage(params: createLanguagesParams) {
  return api.post<LanguagesResponse>('languages/create', { ...params })
}

export type editLanguageParams = Language

export async function editLanguage(params: editLanguageParams) {
  return api.post<LanguagesResponse>('languages/edit', params)
}

export interface removeLanguageParams {
  _id: string
}

export async function removeLanguage(params: removeLanguageParams) {
  return api.post<LanguagesResponse>('languages/remove', params)
}
