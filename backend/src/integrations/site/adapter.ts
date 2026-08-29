import type { SiteAdapter, SiteContext, SiteProductPayload } from './types'
import { siteRequest } from './client'

function requireProductId(data: { productId?: number } | undefined): { productId: number } {
  const productId = data?.productId
  if (typeof productId !== 'number' || !Number.isFinite(productId))
    throw new Error('Site did not return productId')
  return { productId }
}

export const remnantAdapter: SiteAdapter = {
  async ping(ctx: SiteContext) {
    await siteRequest({ ctx, action: 'ping', method: 'GET' })
  },

  async listCategories(ctx: SiteContext) {
    const data = await siteRequest<Array<{ id: number, parentId: number, names: Record<string, string> }>>({
      ctx,
      action: 'categories',
      method: 'GET',
    })
    return Array.isArray(data) ? data : []
  },

  async createProduct(ctx: SiteContext, payload: SiteProductPayload) {
    const data = await siteRequest<{ productId: number }>({
      ctx,
      action: 'createProduct',
      method: 'POST',
      body: payload,
    })
    return requireProductId(data)
  },

  async editProduct(ctx: SiteContext, payload: SiteProductPayload) {
    const data = await siteRequest<{ productId: number }>({
      ctx,
      action: 'editProduct',
      method: 'POST',
      body: payload,
    })
    return requireProductId(data)
  },

  async editQuantity(ctx: SiteContext, payload: { remnantId: string, quantity: number }) {
    await siteRequest({
      ctx,
      action: 'editQuantity',
      method: 'POST',
      body: payload,
    })
  },
}
