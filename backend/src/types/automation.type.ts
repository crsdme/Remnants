import type { Code, DateRange, IdType, Message, Pagination, Sorter, Status } from './common.type'

export interface Automation {
  id: IdType
  trigger: Trigger
  conditions: Condition[]
  actions: Action[]
  active: boolean
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Trigger {
  type: string
  params: IdType[]
}

export interface Condition {
  field: string
  operator: string
  params: any
}

export interface Action {
  field: string
  params: any
}

export interface getAutomationsResult {
  status: Status
  code: Code
  message: Message
  automations: Automation[]
  automationsCount: number
}

export interface getAutomationsFilters {
  trigger: Trigger
  conditions: Condition[]
  actions: Action[]
  active: boolean[]
  createdAt: DateRange
  updatedAt: DateRange
}

export interface getAutomationsSorters {
  trigger: Sorter
  conditions: Sorter
  actions: Sorter
  active: Sorter
}

export interface getAutomationsParams {
  filters?: Partial<getAutomationsFilters>
  sorters?: Partial<getAutomationsSorters>
  pagination?: Partial<Pagination>
}

export interface createAutomationResult {
  status: Status
  code: Code
  message: Message
  automation: Automation
}

export interface createAutomationParams {
  name: string
  trigger: Trigger
  conditions: Condition[]
  actions: Action[]
  active?: boolean
}

export interface editAutomationResult {
  status: Status
  code: Code
  message: Message
  automation: Automation
}

export interface editAutomationParams {
  id: IdType
  name: string
  trigger: Trigger
  conditions: Condition[]
  actions: Action[]
  active?: boolean
}

export interface removeAutomationsResult {
  status: Status
  code: Code
  message: Message
}

export interface removeAutomationsParams {
  ids: IdType[]
}

export interface runAutomationsParams {
  type: string
  entityId: IdType
}

export interface runAutomationsResult {
  status: Status
  code: Code
  message: Message
}
