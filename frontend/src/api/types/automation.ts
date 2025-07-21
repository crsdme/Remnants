export interface getAutomationsParams {
  filters?: {
    name?: string
    ids?: string[]
    active?: boolean[]
    trigger?: string[]
    conditions?: string[]
    actions?: string[]
  }
  sorters?: {
    createdAt?: string
    updatedAt?: string
  }
  pagination?: {
    full?: boolean
    current?: number
    pageSize?: number
  }
}

export interface createAutomationParams {
  name: string
  trigger: string
  conditions: string[]
  actions: string[]
  active?: boolean
}

export interface AutomationResponse {
  status: string
  code: string
  message: string
  description: string
  automations: Automation[]
  automationsCount: number
}

export interface editAutomationParams {
  id: string
  name: string
  trigger: string
  conditions: string[]
  actions: string[]
  active?: boolean
}

export interface removeAutomationsParams {
  ids: string[]
}
