import { parseResponse } from 'test/helpers/parse-response'
import { createWarehousesResponseSchema, getWarehousesResponseSchema } from '@remnant/shared'
import { afterEach, describe, expect, it } from 'vitest'
import * as WarehouseFactory from '../factories/warehouse.factory'

describe('warehouse API', () => {
  afterEach(async () => {
    await WarehouseFactory.removeAll()
  })

  describe('Get Warehouses', () => {
    it('Schema validation', async () => {
      const warehouseResponse = await WarehouseFactory.create({
        names: {
          en: 'Warehouse 1',
          ru: 'Warehouse 1',
        },
        priority: 1,
        active: true,
      })
      const warehouseResponseParsed = parseResponse(createWarehousesResponseSchema, warehouseResponse)

      const response = await WarehouseFactory.get()
      const parsed = parseResponse(getWarehousesResponseSchema, response)

      expect(parsed.data.items.length).toBeGreaterThan(0)
      expect(parsed.data.pagination.total).toBeGreaterThan(0)

      const found = parsed.data.items.find(item => item.id === warehouseResponseParsed.data.id)

      expect(found).toBeDefined()
      expect(found).toMatchObject({
        id: warehouseResponseParsed.data.id,
        names: {
          en: 'Warehouse 1',
          ru: 'Warehouse 1',
        },
        priority: 1,
        active: true,
      })
    })
  })
})
