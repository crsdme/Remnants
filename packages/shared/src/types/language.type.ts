import type {
  IdType,
  Response,
  ResponseItem,
  ResponseList,
} from './common.type'

export interface LanguageDTO {
  id: IdType
  seq: number
  name: string
  code: string
  priority: number
  main: boolean
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export type GetLanguagesResponse = ResponseList<LanguageDTO>

export type CreateLanguageResponse = ResponseItem<LanguageDTO>

export type EditLanguageResponse = ResponseItem<LanguageDTO>

export type RemoveLanguagesResponse = Response
