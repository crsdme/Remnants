import { describe, expect, it } from 'vitest'
import { toMinorCandidates } from '@/utils/money'

describe('toMinorCandidates', () => {
  it('converts major amount with scale 2 (UI price → minorPrice)', () => {
    expect(toMinorCandidates(100, [2])).toEqual([10000])
    expect(toMinorCandidates(19.99, [2])).toEqual([1999])
  })

  it('falls back to scale 2 when scales are empty', () => {
    expect(toMinorCandidates(100, [])).toEqual([10000])
  })

  it('returns unique minors across scales', () => {
    expect(toMinorCandidates(100, [0, 2]).sort((a, b) => a - b)).toEqual([100, 10000])
  })
})
