import type { AuthUser } from '../schemas/auth.schema'
import type {
  IdType,
  Response,
  ResponseItem,
  ResponseList,
} from './common.type'

export interface AutomationTriggerDTO {
  type: string
  params: IdType[]
}

export interface AutomationConditionDTO {
  field: string
  operator: string
  params: unknown
}

export interface AutomationActionDTO {
  field: string
  params: unknown
}

export interface AutomationDTO {
  id: IdType
  name: string
  trigger: AutomationTriggerDTO
  conditions: AutomationConditionDTO[]
  actions: AutomationActionDTO[]
  active: boolean
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export type GetAutomationsResponse = ResponseList<AutomationDTO>

export type CreateAutomationResponse = ResponseItem<AutomationDTO>

export type EditAutomationResponse = ResponseItem<AutomationDTO>

export type RemoveAutomationsResponse = Response

export type RunAutomationsResponse = Response
