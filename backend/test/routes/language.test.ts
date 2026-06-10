import { parseResponse } from 'test/helpers/parse-response'
import { createLanguageResponseSchema, getLanguagesResponseSchema } from '@remnant/shared'
import { afterEach, describe, expect, it } from 'vitest'
import * as LanguageFactory from '../factories/language.factory'

describe('language API', () => {
  afterEach(async () => {
    await LanguageFactory.removeAll()
  })

  describe('Get Languages', () => {
    it('Schema validation', async () => {
      const languageResponse = await LanguageFactory.create({
        name: 'English',
        code: 'en',
        priority: 1,
        main: true,
        active: true,
      })
      const languageResponseParsed = parseResponse(createLanguageResponseSchema, languageResponse)

      const response = await LanguageFactory.get()
      const parsed = parseResponse(getLanguagesResponseSchema, response)

      expect(parsed.data.items.length).toBeGreaterThan(0)
      expect(parsed.data.pagination.total).toBeGreaterThan(0)

      const found = parsed.data.items.find(item => item.id === languageResponseParsed.data.id)

      expect(found).toBeDefined()
      expect(found).toMatchObject({
        id: languageResponseParsed.data.id,
        seq: languageResponseParsed.data.seq,
        name: 'English',
        code: 'en',
        priority: 1,
        main: true,
        active: true,
      })
    })
  })
})
