import type { ProductStockStatusDTO } from '@remnant/shared'
import { describe, expect, it } from 'vitest'
import { pickMatchingStatus } from '@/services/product-stock-status.service'

function status(partial: Partial<ProductStockStatusDTO> & Pick<ProductStockStatusDTO, 'id' | 'priority' | 'isDefault' | 'conditions'>): ProductStockStatusDTO {
  return {
    names: { en: partial.id },
    color: '#000',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...partial,
  }
}

describe('pickMatchingStatus', () => {
  const statuses = [
    status({
      id: 'out',
      priority: 1,
      isDefault: false,
      conditions: [{ field: 'qty', operator: 'eq', value: 0 }],
    }),
    status({
      id: 'low',
      priority: 2,
      isDefault: false,
      conditions: [{ field: 'qty', operator: 'lte', value: 2 }],
    }),
    status({
      id: 'normal',
      priority: 100,
      isDefault: true,
      conditions: [],
    }),
  ]

  it('matches out of stock before low', () => {
    expect(pickMatchingStatus(statuses, {
      qty: 0,
      daysSinceLastSale: 1,
      daysSinceQtyChange: 1,
    })?.id).toBe('out')
  })

  it('matches low stock', () => {
    expect(pickMatchingStatus(statuses, {
      qty: 2,
      daysSinceLastSale: 1,
      daysSinceQtyChange: 1,
    })?.id).toBe('low')
  })

  it('falls back to default', () => {
    expect(pickMatchingStatus(statuses, {
      qty: 10,
      daysSinceLastSale: 1,
      daysSinceQtyChange: 1,
    })?.id).toBe('normal')
  })
})
