import type { AuthUser, UserAccessScopesDTO } from '@remnant/shared'
import { describe, expect, it, vi } from 'vitest'

import * as ProductRepository from '@/repositories/products.repo'
import * as UserAccessRepo from '@/repositories/user-access.repo'
import * as ProductService from '@/services/product.service'

vi.mock('@/repositories/user-access.repo', () => ({
  getScopesByUserId: vi.fn(),
}))

vi.mock('@/repositories/products.repo', () => ({
  list: vi.fn(),
}))

vi.mock('@/services/user.service', () => ({
  checkPermission: vi.fn().mockResolvedValue(false),
}))

vi.mock('@/services/product-stock-status.service', () => ({
  listActiveStatuses: vi.fn().mockResolvedValue([]),
  decorateWarehouseStock: vi.fn(async (stocks: Array<{ warehouseId: string, count: number, stockStatus?: unknown }>) =>
    stocks.map(stock => ({ warehouseId: stock.warehouseId, count: stock.count, stockStatus: stock.stockStatus ?? null })),
  ),
}))

describe('product get with empty warehouse access', () => {
  it('returns products when user has no warehouses', async () => {
    const emptyAccess: UserAccessScopesDTO = {
      warehouses: [],
      cashregisters: [],
      siteIds: [],
      expenseCategoryIds: [],
      cashregisterAccountIds: [],
      deliveryServiceIds: [],
      orderSourceIds: [],
      orderStatusIds: [],
    }

    vi.mocked(UserAccessRepo.getScopesByUserId).mockResolvedValue(emptyAccess)
    vi.mocked(ProductRepository.list).mockResolvedValue({
      items: [{
        _id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        seq: 1,
        names: { en: 'Product', ru: 'Товар' },
        minorPrice: 100,
        currency: {
          id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
          names: { en: 'USD', ru: 'USD' },
          symbols: { en: '$', ru: '$' },
          scale: 2,
        },
        images: [],
        warehouseStock: [{
          warehouseId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
          count: 5,
          stockStatus: null,
        }],
        unit: {
          id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
          names: { en: 'pcs', ru: 'шт' },
          symbols: { en: 'pcs', ru: 'шт' },
        },
        categories: [],
        productProperties: [],
        barcodeIds: [],
        quantityIds: [],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }],
      total: 1,
      page: 1,
      pageSize: 20,
    })

    const user: AuthUser = {
      id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
      login: 'manager',
      permissions: ['product.page', 'product.read'],
    }

    const response = await ProductService.get({
      payload: {
        filters: {},
        pagination: { current: 1, pageSize: 20 },
      } as any,
      user,
    })

    expect(response.status).toBe('success')
    expect(response.data.items).toHaveLength(1)
    expect(response.data.items[0].names.en).toBe('Product')
    // Without viewStock, count is masked to 0
    expect(response.data.items[0].warehouseStock[0].count).toBe(0)
  })
})
