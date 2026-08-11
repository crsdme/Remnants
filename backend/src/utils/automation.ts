export interface AutomationOrderFields {
  orderStatusId?: string | null
  orderSourceId?: string | null
  deliveryServiceId?: string | null
}

export interface AutomationConditionLike {
  field: string
  operator: string
  params?: string[]
}

export function getAutomationConditionValue(
  order: AutomationOrderFields,
  field: string,
): string | undefined {
  switch (field) {
    case 'orderStatus':
      return order.orderStatusId?.toString()
    case 'orderSource':
      return order.orderSourceId?.toString()
    case 'deliveryService':
      return order.deliveryServiceId?.toString()
    default:
      return undefined
  }
}

export function matchesAutomationCondition(
  order: AutomationOrderFields,
  condition: AutomationConditionLike,
): boolean {
  const value = getAutomationConditionValue(order, condition.field)
  const params = (condition.params ?? []).map(String)

  if (value === undefined)
    return false

  if (condition.operator === 'contains')
    return params.includes(value)

  if (condition.operator === 'not-contains')
    return !params.includes(value)

  return false
}

export function matchesAutomationConditions(
  order: AutomationOrderFields,
  conditions: AutomationConditionLike[],
): boolean {
  if (!conditions.length)
    return true

  return conditions.every(condition => matchesAutomationCondition(order, condition))
}

export function matchesAutomationTriggerParams(
  order: AutomationOrderFields,
  triggerType: string,
  triggerParams: string[] = [],
): boolean {
  const params = triggerParams.map(String)
  if (!params.length)
    return true

  if (triggerType === 'order-status-updated')
    return params.includes(order.orderStatusId?.toString() ?? '')

  return true
}
