import { describe, expect, it } from 'vitest'
import { allocateFifo, takeFromLayers, weightedMinorUnitCost, weightedMinorUnitCostInCurrency } from '@/services/fifo.utils'

describe('allocateFifo', () => {
  it('consumes oldest lots first', () => {
    const lots = [
      { id: 'a', remainingCount: 5 },
      { id: 'b', remainingCount: 50 },
    ]
    const { allocations, shortfall } = allocateFifo(lots, 8)
    expect(shortfall).toBe(0)
    expect(allocations).toEqual([
      { lot: lots[0], quantity: 5 },
      { lot: lots[1], quantity: 3 },
    ])
  })

  it('reports shortfall when lots are not enough', () => {
    const { shortfall } = allocateFifo([{ remainingCount: 2 }], 5)
    expect(shortfall).toBe(3)
  })
})

describe('weightedMinorUnitCost', () => {
  it('averages the 100/150 sale example', () => {
    expect(weightedMinorUnitCost([
      { quantity: 5, minorUnitCost: 10000 },
      { quantity: 3, minorUnitCost: 15000 },
    ])).toBe(11875)
  })
})

describe('weightedMinorUnitCostInCurrency', () => {
  it('converts each layer into the sale currency before averaging', async () => {
    const cost = await weightedMinorUnitCostInCurrency(
      [
        { quantity: 2, minorUnitCost: 10000, currencyId: 'uah' },
        { quantity: 2, minorUnitCost: 100, currencyId: 'usd' },
      ],
      'uah',
      async (amount, fromCurrencyId) => fromCurrencyId === 'uah' ? amount : amount * 40,
    )
    expect(cost).toBe(7000)
  })
})

describe('takeFromLayers', () => {
  const layers = [
    { lotId: 'a', quantity: 5, minorUnitCost: 100 },
    { lotId: 'b', quantity: 50, minorUnitCost: 150 },
  ]

  it('skips already received layers', () => {
    expect(takeFromLayers(layers, 5, 8)).toEqual([
      { lotId: 'b', quantity: 8, minorUnitCost: 150 },
    ])
  })

  it('splits a layer', () => {
    expect(takeFromLayers(layers, 2, 5)).toEqual([
      { lotId: 'a', quantity: 3, minorUnitCost: 100 },
      { lotId: 'b', quantity: 2, minorUnitCost: 150 },
    ])
  })
})
