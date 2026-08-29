import type { SiteAdapter, SiteContext, SiteNamedEntity, SiteProductListQuery, SiteProductPayload } from './types'
import { siteRequest } from './client'

function requireProductId(data: { productId?: number } | undefined): { productId: number } {
  const productId = data?.productId
  if (typeof productId !== 'number' || !Number.isFinite(productId))
    throw new Error('Site did not return productId')
  return { productId }
}

function asNamedList(data: unknown): SiteNamedEntity[] {
  if (!Array.isArray(data))
    return []
  return data.filter((item): item is SiteNamedEntity => {
    return item != null
      && typeof item === 'object'
      && typeof (item as SiteNamedEntity).id === 'number'
      && ((item as SiteNamedEntity).names == null || typeof (item as SiteNamedEntity).names === 'object')
  }).map(item => ({
    id: item.id,
    names: item.names ?? {},
    ...(typeof item.parentId === 'number' ? { parentId: item.parentId } : {}),
  }))
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

  async listProducts(ctx: SiteContext, query: SiteProductListQuery = {}) {
    const extra: Record<string, string> = {}
    if (query.query != null && query.query !== '')
      extra.q = query.query
    if (query.ids != null && query.ids.length > 0)
      extra.ids = query.ids.join(',')
    if (query.limit != null)
      extra.limit = String(query.limit)

    const data = await siteRequest<SiteNamedEntity[]>({
      ctx,
      action: 'products',
      method: 'GET',
      query: extra,
    })
    return asNamedList(data)
  },

  async listAttributes(ctx: SiteContext) {
    const data = await siteRequest<SiteNamedEntity[]>({
      ctx,
      action: 'attributes',
      method: 'GET',
    })
    return asNamedList(data)
  },

  async listLanguages(ctx: SiteContext) {
    const data = await siteRequest<SiteNamedEntity[]>({
      ctx,
      action: 'languages',
      method: 'GET',
    })
    return asNamedList(data)
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

  async linkProduct(ctx: SiteContext, payload: { remnantId: string, productId: number }) {
    await siteRequest({
      ctx,
      action: 'linkProduct',
      method: 'POST',
      body: payload,
    })
  },

  async unlinkProduct(ctx: SiteContext, payload: { remnantId: string }) {
    await siteRequest({
      ctx,
      action: 'unlinkProduct',
      method: 'POST',
      body: payload,
    })
  },
}
