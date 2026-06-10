import { createAutomationResponseSchema, getAutomationsResponseSchema } from '@remnant/shared'
import { afterEach, describe, expect, it } from 'vitest'
import * as AutomationFactory from '../factories/automation.factory'
import { parseResponse } from '../helpers/parse-response'

describe('Automation API', () => {
  afterEach(async () => {
    await AutomationFactory.removeAll()
  })

  describe('Get Automations', () => {
    it('Schema validation', async () => {
      const createdResponse = await AutomationFactory.create({
        name: 'Automation 1',
        trigger: { type: 'order-status-updated', params: ['param 1'] },
        conditions: [{ field: 'condition 1', operator: 'contains', params: ['param 1'] }],
        actions: [{ field: 'order-status-update', params: ['param 1'] }],
        active: true,
      })
      const createdResponseParsed = parseResponse(createAutomationResponseSchema, createdResponse)

      const response = await AutomationFactory.get()
      const parsed = parseResponse(getAutomationsResponseSchema, response)

      expect(parsed.data.items.length).toBeGreaterThan(0)
      expect(parsed.data.pagination.total).toBeGreaterThan(0)

      const found = parsed.data.items.find(item => item.id === createdResponseParsed.data.id)

      expect(found).toBeDefined()
      expect(found).toMatchObject({
        id: createdResponseParsed.data.id,
        name: 'Automation 1',
        trigger: { type: 'order-status-updated', params: ['param 1'] },
        conditions: [{ field: 'condition 1', operator: 'contains', params: ['param 1'] }],
        actions: [{ field: 'order-status-update', params: ['param 1'] }],
        active: true,
      })
    })
  })
})
