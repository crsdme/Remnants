import { describe, expect, it } from 'vitest'
import {
  extractLastUuidInParens,
  parseId,
  parseProductProperties,
} from '@/utils/parseTools'

const UUID = '550e8400-e29b-41d4-a716-446655440000'
const UUID2 = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

describe('extractLastUuidInParens', () => {
  it('takes the last (uuid) when the label has parentheses', () => {
    expect(extractLastUuidInParens(`category (name) (${UUID})`)).toBe(UUID)
  })

  it('handles messy parentheses around the uuid', () => {
    expect(extractLastUuidInParens(`name( (${UUID})`)).toBe(UUID)
  })

  it('prefers the last uuid when several appear', () => {
    expect(extractLastUuidInParens(`foo (${UUID}) bar (${UUID2})`)).toBe(UUID2)
  })
})

describe('parseId', () => {
  it('parses trailing (uuid) with parentheses in the name', () => {
    expect(parseId({ currency: `USD (bucks) (${UUID})` }, 'currency')).toBe(UUID)
  })

  it('parses bare uuid', () => {
    expect(parseId({ id: UUID }, 'id')).toBe(UUID)
  })
})

describe('parseProductProperties', () => {
  it('uses the last (uuid) in the header and cell', () => {
    const rows = parseProductProperties({
      [`Color (extra) (${UUID})`]: `Red (dark) (${UUID2})`,
    })
    expect(rows).toEqual([{ _id: UUID, value: UUID2 }])
  })
})
