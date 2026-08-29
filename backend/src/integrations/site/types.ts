export interface SiteContext {
  url: string
  key: string
}

export interface SiteProductImage {
  url: string
  name: string
}

export interface SiteProductPayload {
  remnantId: string
  names: Record<string, string>
  price: number
  quantity?: number
  categoryIds: number[]
  images: SiteProductImage[]
  seo?: Record<string, string>
}

export interface SiteCategory {
  id: number
  parentId: number
  names: Record<string, string>
}

export interface SiteAdapter {
  ping: (__ctx: SiteContext) => Promise<void>
  listCategories: (__ctx: SiteContext) => Promise<SiteCategory[]>
  createProduct: (__ctx: SiteContext, __payload: SiteProductPayload) => Promise<{ productId: number }>
  editProduct: (__ctx: SiteContext, __payload: SiteProductPayload) => Promise<{ productId: number }>
  editQuantity: (__ctx: SiteContext, __payload: { remnantId: string, quantity: number }) => Promise<void>
}
