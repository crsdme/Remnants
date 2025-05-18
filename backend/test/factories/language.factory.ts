import path from 'node:path'
import request from 'supertest'
import app from '../../src/'
import { LanguageModel } from '../../src/models/language.model'

export async function create(language?: any) {
  if (!language) {
    language = {
      name: 'English',
      code: 'en',
      priority: 1,
      main: true,
      active: true,
      removed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  const res = await request(app).post('/api/languages/create').send(language)

  return res
}

export async function get(params?: any) {
  if (!params) {
    params = {
      'pagination[current]': 1,
      'pagination[pageSize]': 10,
    }
  }

  const res = await request(app).get('/api/languages/get').query(params)

  return res
}

export async function edit(params: any) {
  const res = await request(app).post('/api/languages/edit').send(params)

  return res
}

export async function duplicate(ids: string[]) {
  const res = await request(app).post('/api/languages/duplicate').send({ ids })

  return res
}

export async function upload(filePath?: string) {
  if (!filePath) {
    filePath = path.join(__dirname, '../files/test-import-languages.csv')
  }

  const res = await request(app).post('/api/languages/import').attach('file', filePath)

  return res
}

export async function batch(params: any) {
  const res = await request(app).post('/api/languages/batch').send(params)

  return res
}

export async function remove(ids: string[]) {
  const res = await request(app).post('/api/languages/remove').send({ ids })

  return res
}

export async function removeAll() {
  const res = await LanguageModel.deleteMany({})

  return res
}
