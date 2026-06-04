import type { AutomationDTO } from '@remnant/shared'
import type { AutomationDB } from '@/types'

export function mapAutomationAggregateToDTO(row: AutomationDTO): AutomationDTO {
  return row
}

export function mapAutomationDocToDTO(doc: AutomationDB): AutomationDTO {
  return {
    id: String(doc._id),
    name: doc.name,
    trigger: {
      type: doc.trigger.type,
      params: doc.trigger.params,
    },
    conditions: doc.conditions.map(condition => ({
      field: condition.field,
      operator: condition.operator,
      params: condition.params,
    })),
    actions: doc.actions.map(action => ({
      field: action.field,
      params: action.params,
    })),
    active: doc.active,
    removed: doc.removed,
    createdAt: doc.createdAt as unknown as Date,
    updatedAt: doc.updatedAt as unknown as Date,
  }
}
