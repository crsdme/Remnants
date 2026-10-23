import { describe, expect, it } from 'vitest'
import {
  matchesAutomationCondition,
  matchesAutomationConditions,
  matchesAutomationTriggerParams,
  shouldFireOrderPaidTrigger,
} from '@/utils/automation'

describe('automation conditions', () => {
  const order = {
    orderStatusId: 'status-a',
    orderSourceId: 'source-a',
    deliveryServiceId: 'delivery-a',
  }

  it('matches contains', () => {
    expect(matchesAutomationCondition(order, {
      field: 'orderStatus',
      operator: 'contains',
      params: ['status-a', 'status-b'],
    })).toBe(true)
  })

  it('matches not-contains', () => {
    expect(matchesAutomationCondition(order, {
      field: 'orderStatus',
      operator: 'not-contains',
      params: ['status-removed'],
    })).toBe(true)
  })

  it('rejects unknown field', () => {
    expect(matchesAutomationCondition(order, {
      field: 'unknown',
      operator: 'contains',
      params: ['x'],
    })).toBe(false)
  })

  it('passes when conditions are empty', () => {
    expect(matchesAutomationConditions(order, [])).toBe(true)
  })

  it('matches order-status-updated trigger params', () => {
    expect(matchesAutomationTriggerParams(order, 'order-status-updated', ['status-a'])).toBe(true)
    expect(matchesAutomationTriggerParams(order, 'order-status-updated', ['other'])).toBe(false)
  })

  it('ignores trigger params for order-removed', () => {
    expect(matchesAutomationTriggerParams(order, 'order-removed', ['anything'])).toBe(true)
  })

  it('fires order-paid on transition into paid/overpaid', () => {
    expect(shouldFireOrderPaidTrigger('unpaid', 'paid')).toBe(true)
    expect(shouldFireOrderPaidTrigger('partially_paid', 'paid')).toBe(true)
    expect(shouldFireOrderPaidTrigger('unpaid', 'overpaid')).toBe(true)
    expect(shouldFireOrderPaidTrigger('paid', 'paid')).toBe(false)
    expect(shouldFireOrderPaidTrigger('overpaid', 'paid')).toBe(false)
    expect(shouldFireOrderPaidTrigger('paid', 'overpaid')).toBe(false)
    expect(shouldFireOrderPaidTrigger('unpaid', 'partially_paid')).toBe(false)
  })
})
