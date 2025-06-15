import path from 'node:path'
import request from 'supertest'
import app from '../../src/'
import { UnitModel } from '../../src/models/unit.model'

export async function create(unit?: any) {
  if (!unit) {
    unit = {
      names: {
        en: 'Meter',
        ru: 'Метр',
      },
      symbols: {
        en: 'm',
        ru: 'м',
      },
      priority: 1,
      main: true,
      active: true,
    }
  }

  const res = await request(app).post('/api/units/create').send(unit)

  return res
}

export async function get(params?: any) {
  if (!params) {
    params = {
      'pagination[current]': 1,
      'pagination[pageSize]': 10,
    }
  }

  const res = await request(app).get('/api/units/get').query(params)

  return res
}

export async function edit(params: any) {
  const res = await request(app).post('/api/units/edit').send(params)

  return res
}

export async function duplicate(ids: string[]) {
  const res = await request(app).post('/api/units/duplicate').send({ ids })

  return res
}

export async function upload(filePath?: string) {
  if (!filePath) {
    filePath = path.join(__dirname, '../files/test-import-units.csv')
  }

  const res = await request(app).post('/api/units/import').attach('file', filePath)

  return res
}

export async function batch(params: any) {
  const res = await request(app).post('/api/units/batch').send(params)

  return res
}

export async function remove(ids: string[]) {
  const res = await request(app).post('/api/units/remove').send({ ids })

  return res
}

export async function removeAll() {
  const res = await UnitModel.deleteMany({})

  return res
}
