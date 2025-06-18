import { afterEach, describe, expect, it } from 'vitest'
import * as LanguageFactory from '../factories/language.factory'
import { expectValidationError } from '../helpers/expectValidationError'

describe('language API', () => {
  afterEach(async () => {
    await LanguageFactory.removeAll()
  })

  describe('Create Language', () => {
    it('should create a language', async () => {
      const res = await LanguageFactory.create()
      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('language')
    })
  })

  describe('Get Languages', () => {
    it('should return list of languages', async () => {
      await LanguageFactory.create()
      const res = await LanguageFactory.get()

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('languages')
      expect(res.body).toHaveProperty('languagesCount')

      const { languages, languagesCount } = res.body

      expect(Array.isArray(languages)).toBe(true)
      expect(languages.length).toBeGreaterThan(0)

      const found = languages.find((lang: any) => lang.code === 'en')
      expect(found).toBeDefined()
      expect(languagesCount).toBeGreaterThan(0)
    })
  })

  describe('Edit Language', () => {
    it('should edit a language', async () => {
      const params = {
        id: null,
        name: 'English Edited',
        code: 'en',
        priority: 2,
        main: false,
        active: false,
      }

      const createdLanguage = await LanguageFactory.create(params)
      params.id = createdLanguage.body.language.id

      const res = await LanguageFactory.edit(params)

      expect(res.status).toBe(200)
      expect(res.body.language).toMatchObject(params)
    })
  })

  describe('Remove Language', () => {
    it('should remove a language', async () => {
      const createdLanguage = await LanguageFactory.create()
      const createdLanguageId = createdLanguage.body.language.id

      const res = await LanguageFactory.remove([createdLanguageId])

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
    })
  })

  describe('Duplicate Language', () => {
    it('should duplicate a language', async () => {
      const createdLanguage = await LanguageFactory.create()
      const createdLanguageId = createdLanguage.body.language.id

      const res = await LanguageFactory.duplicate([createdLanguageId])

      expect(res.status).toBe(200)
    })
  })

  describe('Import Languages', () => {
    it('should import languages from file', async () => {
      const res = await LanguageFactory.upload()

      expect(res.status).toBe(200)
      expect(res.body.languageIds).toBeDefined()
      expect(Array.isArray(res.body.languageIds)).toBe(true)
    })
  })

  describe('Batch Update Imported Languages', () => {
    it('should batch update imported languages', async () => {
      const resImport = await LanguageFactory.upload()
      const createdImportedLanguageIds = resImport.body.languageIds

      const resBatch = await LanguageFactory.batch({
        ids: createdImportedLanguageIds,
        params: [
          { column: 'name', value: 'English Batch' },
        ],
      })

      expect(resBatch.status).toBe(200)
      expect(resBatch.body.status).toBe('success')
    })
  })

  describe('Language Flow | Create -> Edit -> Remove', () => {
    it('should test currency flow', async () => {
      const resCreate = await LanguageFactory.create()
      const createdLanguageId = resCreate.body.language.id

      const resEdit = await LanguageFactory.edit({
        id: createdLanguageId,
        name: 'English Batch',
        code: 'enBatch',
        priority: 333,
      })

      const resRemove = await LanguageFactory.remove([createdLanguageId])

      expect(resCreate.status).toBe(201)
      expect(resEdit.status).toBe(200)
      expect(resRemove.status).toBe(200)
    })
  })

  describe('Language Flow | Import -> Batch -> Remove', () => {
    it('should test currency flow', async () => {
      const resImport = await LanguageFactory.upload()
      const createdImportedLanguageIds = resImport.body.languageIds

      const resBatch = await LanguageFactory.batch({
        ids: createdImportedLanguageIds,
        params: [{ column: 'name', value: 'English Batch' }],
      })

      const resRemove = await LanguageFactory.remove(createdImportedLanguageIds)

      expect(resImport.status).toBe(200)
      expect(resBatch.status).toBe(200)
      expect(resRemove.status).toBe(200)
    })
  })

  describe('Error Handling', () => {
    it('without name', async () => {
      await expectValidationError('/api/languages/create', { code: 'en', priority: 1, main: false, active: true })
    })
    it('without code', async () => {
      await expectValidationError('/api/languages/create', { name: 'test', priority: 1, main: false, active: true })
    })
    it('without priority', async () => {
      await expectValidationError('/api/languages/create', { name: 'test', code: 'en', main: false, active: true })
    })
  })
})
