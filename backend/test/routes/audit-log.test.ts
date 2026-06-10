import { parseResponse } from 'test/helpers/parse-response'
import { createAuditLogsResponseSchema, getAuditLogsResponseSchema } from '@remnant/shared'
import { afterEach, describe, expect, it } from 'vitest'
import * as AuditLogFactory from '../factories/audit-log.factory'

describe('Audit Log API', () => {
  afterEach(async () => {
    await AuditLogFactory.removeAll()
  })

  describe('Get Audit Logs', () => {
    it('Schema validation', async () => {
      // const createdResponse = await AuditLogFactory.create({
      //   resourceType: 'user',
      //   resourceId: '123',
      //   action: 'create',
      //   changes: [{ path: 'name', before: 'John', after: 'Jane' }],
      //   comment: 'User created',
      // })
      // const createdResponseParsed = parseResponse(createAuditLogsResponseSchema, createdResponse)

      // const response = await AuditLogFactory.get()
      // const parsed = parseResponse(getAuditLogsResponseSchema, response)

      // expect(parsed.data.items.length).toBeGreaterThan(0)
      // expect(parsed.data.pagination.total).toBeGreaterThan(0)

      // const found = parsed.data.items.find(item => item.id === createdResponseParsed.data.id)

      // expect(found).toBeDefined()
      // expect(found).toMatchObject({
      //   id: createdResponseParsed.data.id,
      //   resourceType: 'user',
      //   resourceId: '123',
      //   action: 'create' as const,
      //   changes: [{ path: 'name', before: 'John', after: 'Jane' }],
      //   comment: 'User created',
      // })
    })
  })
})
