import { afterEach, describe, expect, it } from 'vitest'
import * as UnitFactory from '../factories/unit.factory'
import { expectValidationError } from '../helpers/expectValidationError'

describe('unit API', () => {
  afterEach(async () => {
    await UnitFactory.removeAll()
  })

  describe('Create Currency', () => {
    it('should create a unit', async () => {
      const res = await UnitFactory.create()
      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('unit')
    })
  })

  describe('Get Units', () => {
    it('should return list of units', async () => {
      await UnitFactory.create()
      const res = await UnitFactory.get()

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('units')
      expect(res.body).toHaveProperty('unitsCount')

      const { units, unitsCount } = res.body

      expect(Array.isArray(units)).toBe(true)
      expect(units.length).toBeGreaterThan(0)

      const found = units.find((unit: any) => unit.names.en === 'Meter')
      expect(found).toBeDefined()
      expect(unitsCount).toBeGreaterThan(0)
    })
  })

  describe('Edit Unit', () => {
    it('should edit a unit', async () => {
      const params = {
        id: null,
        names: {
          en: 'Meter Edited',
          ru: 'Метр Изменен',
        },
        symbols: {
          en: 'm',
          ru: 'м',
        },
        priority: 2,
        active: false,
      }

      const createdUnit = await UnitFactory.create(params)
      params.id = createdUnit.body.unit.id

      const res = await UnitFactory.edit(params)

      expect(res.status).toBe(200)
      expect(res.body.unit).toMatchObject(params)
    })
  })

  describe('Remove Unit', () => {
    it('should remove a unit', async () => {
      const createdUnit = await UnitFactory.create()
      const createdUnitId = createdUnit.body.unit.id

      const res = await UnitFactory.remove([createdUnitId])

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
    })
  })

  describe('Duplicate Unit', () => {
    it('should duplicate a unit', async () => {
      const createdUnit = await UnitFactory.create()
      const createdUnitId = createdUnit.body.unit.id

      const res = await UnitFactory.duplicate([createdUnitId])

      expect(res.status).toBe(200)
    })
  })

  describe('Import Units', () => {
    it('should import units from file', async () => {
      const res = await UnitFactory.upload()
      expect(res.status).toBe(200)
      expect(res.body.unitIds).toBeDefined()
      expect(Array.isArray(res.body.unitIds)).toBe(true)
    })
  })

  describe('Batch Update Imported Units', () => {
    it('should batch update imported units', async () => {
      const resImport = await UnitFactory.upload()
      const createdImportedUnitIds = resImport.body.unitIds

      const resBatch = await UnitFactory.batch({
        ids: createdImportedUnitIds,
        params: [
          { column: 'names', value: { en: 'Meter Edited', ru: 'Метр Изменен' } },
        ],
      })

      expect(resBatch.status).toBe(200)
      expect(resBatch.body.status).toBe('success')
    })
  })

  describe('Unit Flow | Create -> Edit -> Remove', () => {
    it('should test unit flow', async () => {
      const resCreate = await UnitFactory.create()
      const createdUnitId = resCreate.body.unit.id

      const resEdit = await UnitFactory.edit({
        id: createdUnitId,
        names: {
          en: 'Meter Edited',
          ru: 'Метр Изменен',
        },
        symbols: {
          en: 'm',
          ru: 'м',
        },
        priority: 333,
      })

      const resRemove = await UnitFactory.remove([createdUnitId])

      expect(resCreate.status).toBe(201)
      expect(resEdit.status).toBe(200)
      expect(resRemove.status).toBe(200)
    })
  })

  describe('Unit Flow | Import -> Batch -> Remove', () => {
    it('should test unit flow', async () => {
      const resImport = await UnitFactory.upload()
      const createdImportedUnitIds = resImport.body.unitIds

      const resBatch = await UnitFactory.batch({
        ids: createdImportedUnitIds,
        params: [{ column: 'names', value: { en: 'Meter Edited', ru: 'Метр Изменен' } }],
      })

      const resRemove = await UnitFactory.remove(createdImportedUnitIds)

      expect(resImport.status).toBe(200)
      expect(resBatch.status).toBe(200)
      expect(resRemove.status).toBe(200)
    })
  })

  describe('Error Handling', () => {
    it('without name', async () => {
      await expectValidationError('/api/units/create', { names: { en: 'Meter', ru: 'Метр' }, priority: 1, main: false, active: true })
    })
    it('without symbols', async () => {
      await expectValidationError('/api/units/create', { symbols: { en: 'm', ru: 'м' }, priority: 1, main: false, active: true })
    })
  })
})
