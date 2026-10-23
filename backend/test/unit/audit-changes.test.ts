import { describe, expect, it } from 'vitest'
import { buildAuditChanges } from '@/utils/getDiff'

describe('buildAuditChanges', () => {
  it('diffs documents that expose toObject', () => {
    const before = {
      toObject: () => ({
        names: new Map([['en', 'Old']]),
        active: true,
        _id: 'x',
        createdAt: new Date('2020-01-01'),
      }),
    }
    const after = {
      toObject: () => ({
        names: { en: 'New' },
        active: true,
        _id: 'x',
      }),
    }

    expect(buildAuditChanges(before, after)).toEqual([
      { path: 'names.en', before: 'Old', after: 'New' },
    ])
  })

  it('records every field on create and clears them on remove', () => {
    const doc = { names: { en: 'A' }, active: true }

    expect(buildAuditChanges(null, doc)).toEqual([
      { path: 'names.en', before: undefined, after: 'A' },
      { path: 'active', before: undefined, after: true },
    ])

    expect(buildAuditChanges(doc, null)).toEqual([
      { path: 'names', before: { en: 'A' }, after: null },
      { path: 'active', before: true, after: null },
    ])
  })
})
