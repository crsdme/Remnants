import { parseResponse } from 'test/helpers/parse-response'
import { createUnitResponseSchema, getUnitsResponseSchema } from '@remnant/shared'
import { afterEach, describe, expect, it } from 'vitest'
import * as UnitFactory from '../factories/unit.factory'

describe('unit API', () => {
  afterEach(async () => {
    await UnitFactory.removeAll()
  })

  describe('Get Units', () => {
    it('Schema validation', async () => {
      const unitResponse = await UnitFactory.create({
        names: { en: 'Piece', ru: 'Штука' },
        symbols: { en: 'pcs', ru: 'шт' },
        priority: 1,
        active: true,
      })
      const unitResponseParsed = parseResponse(createUnitResponseSchema, unitResponse)

      const response = await UnitFactory.get()
      const parsed = parseResponse(getUnitsResponseSchema, response)

      expect(parsed.data.items.length).toBeGreaterThan(0)
      expect(parsed.data.pagination.total).toBeGreaterThan(0)

      const found = parsed.data.items.find(item => item.id === unitResponseParsed.data.id)

      expect(found).toBeDefined()
      expect(found).toMatchObject({
        id: unitResponseParsed.data.id,
        names: { en: 'Piece', ru: 'Штука' },
        symbols: { en: 'pcs', ru: 'шт' },
        priority: 1,
        active: true,
      })
    })
  })
})
