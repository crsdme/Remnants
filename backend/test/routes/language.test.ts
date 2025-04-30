import path from 'node:path'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import app from '../../src/'

describe('language API', () => {
  let createdLanguageId: string
  let createdImportedLanguageIds: string[] = []

  beforeAll(async () => {
    const res = await request(app).post('/api/languages/create').send({
      name: 'English',
      code: 'en',
      priority: 1,
      main: true,
      active: true,
    })
    createdLanguageId = res.body.language._id
  })

  afterAll(async () => {
    await request(app).post('/api/languages/remove').send({
      _ids: [createdLanguageId, ...createdImportedLanguageIds],
    })
  })

  describe('Create Language', () => {
    it('should create a language', async () => {
      expect(createdLanguageId).toBeDefined()
    })
  })

  describe('Get Languages', () => {
    it('should return list of languages', async () => {
      const res = await request(app).get('/api/languages/get').query({
        'pagination[current]': 1,
        'pagination[pageSize]': 10,
        'filters[name]': '',
        'filters[code]': '',
        'filters[priority]': '',
        'filters[main]': '',
        'filters[active]': '',
      })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('languages')
      expect(res.body).toHaveProperty('languagesCount')
      expect(Array.isArray(res.body.languages)).toBe(true)
    })
  })

  describe('Duplicate Language', () => {
    it('should duplicate a language', async () => {
      const res = await request(app).post('/api/languages/duplicate').send({
        _ids: [createdLanguageId],
      })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('status')
      expect(res.body.status).toBe('success')
    })
  })

  describe('Edit Language', () => {
    it('should edit a language', async () => {
      const res = await request(app).post('/api/languages/edit').send({
        _id: createdLanguageId,
        name: 'English Edited',
        code: 'en',
        priority: 2,
        main: false,
        active: false,
      })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('status')
      expect(res.body.status).toBe('success')
    })
  })

  describe('Import Languages', () => {
    it('should import languages from file', async () => {
      const filePath = path.join(__dirname, '../files/test-import-languages.csv')

      const res = await request(app).post('/api/languages/import').attach('file', filePath)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('status')
      expect(res.body.status).toBe('success')
    })
  })

  describe('Get Imported Languages', () => {
    it('should return list of imported languages', async () => {
      const res = await request(app).get('/api/languages/get').query({
        'pagination[current]': 1,
        'pagination[pageSize]': 10,
        'filters[name]': '',
        'filters[code]': '',
        'filters[priority]': '',
        'filters[main]': '',
        'filters[active]': '',
      })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('languages')
      expect(res.body).toHaveProperty('languagesCount')
      expect(Array.isArray(res.body.languages)).toBe(true)

      createdImportedLanguageIds = res.body.languages
        .filter((language: any) => language._id !== createdLanguageId)
        .map((language: any) => language._id)
    })
  })

  describe('Batch Update Imported Languages', () => {
    it('should batch update imported languages', async () => {
      const res = await request(app).post('/api/languages/batch').send({
        _ids: createdImportedLanguageIds,
        params: [
          { column: 'name', value: 'English Batch' },
          { column: 'code', value: 'en-batch' },
          { column: 'priority', value: 11 },
          { column: 'main', value: true },
          { column: 'active', value: false },
        ],
      })

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
    })
  })

  describe('Get Batched Languages', () => {
    it('should return list of batched languages', async () => {
      const res = await request(app).get('/api/languages/get').query({
        'pagination[current]': 1,
        'pagination[pageSize]': 10,
        'filters[name]': '',
        'filters[code]': '',
        'filters[priority]': '',
        'filters[main]': '',
        'filters[active]': '',
      })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('languages')
      expect(res.body).toHaveProperty('languagesCount')
      expect(Array.isArray(res.body.languages)).toBe(true)
    })
  })

  describe('Language API Error Handling', () => {
    describe('Create Language Errors', () => {
      it('should fail if name is missing', async () => {
        const res = await request(app).post('/api/languages/create').send({
          code: 'en',
          priority: 1,
          main: true,
          active: true,
        })

        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error')
      })

      it('should fail if code is missing', async () => {
        const res = await request(app).post('/api/languages/create').send({
          name: 'English',
          priority: 1,
          main: true,
          active: true,
        })

        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error')
      })
    })

    describe('Import Language Errors', () => {
      it('should fail if no file is uploaded', async () => {
        const res = await request(app).post('/api/languages/import')
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error')
      })
    })

    describe('Batch Language Errors', () => {
      it('should fail if _ids array is missing', async () => {
        const res = await request(app).post('/api/languages/batch').send({
          params: [
            { column: 'priority', value: 111 },
          ],
        })

        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error')
      })

      it('should fail if params array is missing', async () => {
        const res = await request(app).post('/api/languages/batch').send({
          _ids: ['some-random-id'],
        })

        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error')
      })
    })

    describe('Edit Language Errors', () => {
      it('should fail if _id is missing', async () => {
        const res = await request(app).post('/api/languages/edit').send({
          name: 'English',
          code: 'en',
          priority: 1,
          main: true,
          active: true,
        })

        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error')
      })
    })
  })
})
