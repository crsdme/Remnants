import { parseResponse } from 'test/helpers/parse-response'
import { createClientResponseSchema, getClientsResponseSchema } from '@remnant/shared'
import { afterEach, describe, expect, it } from 'vitest'
import * as ClientFactory from '../factories/client.factory'

describe('client API', () => {
  afterEach(async () => {
    await ClientFactory.removeAll()
  })

  describe('Get Clients', () => {
    it('Schema validation', async () => {
      const clientResponse = await ClientFactory.create({
        name: 'John Doe',
        middleName: 'Doe',
        lastName: 'John',
        country: 'USA',
        emails: ['john.doe@example.com'],
        phones: ['+1234567890'],
        addresses: ['123 Main St, Anytown, USA'],
        socials: [{ type: 'facebook', value: 'https://www.facebook.com/john.doe' }],
        comment: 'This is a test comment',
      })
      const clientResponseParsed = parseResponse(createClientResponseSchema, clientResponse)

      const response = await ClientFactory.get()
      const parsed = parseResponse(getClientsResponseSchema, response)

      expect(parsed.data.items.length).toBeGreaterThan(0)
      expect(parsed.data.pagination.total).toBeGreaterThan(0)

      const found = parsed.data.items.find(item => item.id === clientResponseParsed.data.id)

      expect(found).toBeDefined()
      expect(found).toMatchObject({
        id: clientResponseParsed.data.id,
        name: 'John Doe',
        middleName: 'Doe',
        lastName: 'John',
        country: 'USA',
        emails: ['john.doe@example.com'],
        phones: ['+1234567890'],
        addresses: ['123 Main St, Anytown, USA'],
        socials: [{ type: 'facebook', value: 'https://www.facebook.com/john.doe' }],
        comment: 'This is a test comment',
      })
    })
  })
})
