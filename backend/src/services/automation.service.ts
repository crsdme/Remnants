import type * as AutomationTypes from '../types/automation.type'
import { AutomationModel, MoneyTransactionModel, OrderModel } from '../models'
import { HttpError } from '../utils/httpError'
import { buildQuery, buildSortQuery } from '../utils/queryBuilder'

export async function get(payload: AutomationTypes.getAutomationsParams): Promise<AutomationTypes.getAutomationsResult> {
  const { current = 1, pageSize = 10 } = payload.pagination || {}

  const {
    trigger = '',
    active = undefined,
    conditions = undefined,
    actions = undefined,
    createdAt = {
      from: undefined,
      to: undefined,
    },
    updatedAt = {
      from: undefined,
      to: undefined,
    },
  } = payload.filters || {}

  const sorters = buildSortQuery(payload.sorters || {}, { createdAt: 1 })

  const filterRules = {
    trigger: { type: 'string', langAware: true },
    conditions: { type: 'array' },
    actions: { type: 'array' },
    active: { type: 'array' },
    createdAt: { type: 'dateRange' },
    updatedAt: { type: 'dateRange' },
  } as const

  const query = buildQuery({
    filters: { trigger, conditions, actions, active, createdAt, updatedAt },
    rules: filterRules,
  })

  const pipeline = [
    {
      $match: query,
    },
    {
      $sort: sorters,
    },
    {
      $facet: {
        automations: [
          { $skip: (current - 1) * pageSize },
          { $limit: pageSize },
        ],
        totalCount: [
          { $count: 'count' },
        ],
      },
    },
  ]

  const automationsRaw = await AutomationModel.aggregate(pipeline).exec()

  const automations = automationsRaw[0].automations.map((doc: any) => AutomationModel.hydrate(doc))
  const automationsCount = automationsRaw[0].totalCount[0]?.count || 0

  return { status: 'success', code: 'AUTOMATIONS_FETCHED', message: 'Automations fetched', automations, automationsCount }
}

export async function create(payload: AutomationTypes.createAutomationParams): Promise<AutomationTypes.createAutomationResult> {
  const automation = await AutomationModel.create(payload)

  return { status: 'success', code: 'AUTOMATION_CREATED', message: 'Automation created', automation }
}

export async function edit(payload: AutomationTypes.editAutomationParams): Promise<AutomationTypes.editAutomationResult> {
  const { id } = payload

  const automation = await AutomationModel.findOneAndUpdate({ _id: id }, payload)

  if (!automation) {
    throw new HttpError(400, 'Automation not edited', 'AUTOMATION_NOT_EDITED')
  }

  return { status: 'success', code: 'AUTOMATION_EDITED', message: 'Automation edited', automation }
}

export async function remove(payload: AutomationTypes.removeAutomationsParams): Promise<AutomationTypes.removeAutomationsResult> {
  const { ids } = payload

  const automations = await AutomationModel.updateMany(
    { _id: { $in: ids } },
    { $set: { removed: true } },
  )

  if (!automations) {
    throw new HttpError(400, 'Automations not removed', 'AUTOMATIONS_NOT_REMOVED')
  }

  return { status: 'success', code: 'AUTOMATIONS_REMOVED', message: 'Automations removed' }
}

const automationHandlers: Record<string, (payload: any) => Promise<void>> = {
  'order-created': async ({ conditions, actions, entity }: any) => {
    if (evaluateConditions(conditions, entity)) {
      await applyActions(actions, entity)
    }
  },
  'order-updated': async ({ conditions, actions, entity }: any) => {
    if (evaluateConditions(conditions, entity)) {
      await applyActions(actions, entity)
    }
  },
  'order-removed': async ({ conditions, actions, entity }: any) => {
    if (evaluateConditions(conditions, entity)) {
      await applyActions(actions, entity)
    }
  },
  'money-transaction-created': async ({ conditions, actions, entity }: any) => {
    if (evaluateConditions(conditions, entity)) {
      await applyActions(actions, entity)
    }
  },
}

export async function run(payload: AutomationTypes.runAutomationsParams): Promise<AutomationTypes.runAutomationsResult> {
  const { type, entityId } = payload

  const automations = await AutomationModel.find({ 'trigger.type': type, 'removed': false, 'active': true })

  const entity = await loadEntityByType(type, entityId)

  if (!entity) {
    throw new HttpError(400, `Entity not found: ${type} with ID ${entityId}`, 'ENTITY_NOT_FOUND')
  }

  for (const automation of automations) {
    const handler = automationHandlers[type]
    if (handler) {
      await handler({ ...automation.toObject(), entity })
    }
  }

  return { status: 'success', code: 'AUTOMATIONS_REMOVED', message: 'Automations removed' }
}

async function loadEntityByType(type: string, id: string): Promise<any> {
  switch (type) {
    case 'order-created':
      return await OrderModel.findById(id)
    case 'order-updated':
      return await OrderModel.findById(id)
    case 'order-removed':
      return await OrderModel.findById(id)

    case 'money-transaction-created':
      return await MoneyTransactionModel.findById(id)
    case 'money-transaction-updated':
      return await MoneyTransactionModel.findById(id)

    default:
      throw new Error(`Unsupported trigger type: ${type}`)
  }
}

function evaluateConditions(conditions: AutomationTypes.Condition[], entity: Record<string, any>): boolean {
  return conditions.every(({ field, operator, params }) => {
    const value = entity[field]

    switch (operator) {
      case 'contains':
        return Array.isArray(value) ? value.includes(params[0]) : value === params[0]

      case 'not-contains':
        return Array.isArray(value) ? !value.includes(params[0]) : value !== params[0]

      case 'equals':
        return value === params[0]

      case 'not-equal':
        return value !== params[0]

      case 'in':
        return params.includes(value)

      default:
        return false
    }
  })
}

async function applyActions(actions: AutomationTypes.Action[], entity: any): Promise<void> {
  for (const { field, params } of actions) {
    switch (field) {
      case 'order-status-update':
        entity.orderStatus = params[0]
        break
    }
  }

  if (typeof entity.save === 'function') {
    return await entity.save()
  }
}
