export interface SiteContext {
  url: string
  key: string
}

export interface SiteProductImage {
  url: string
  name: string
}

export interface SiteProductAttribute {
  attributeId: number
  text: Record<string, string> | string
}

export interface SiteProductPayload {
  remnantId: string
  names: Record<string, string>
  price: number
  quantity?: number
  categoryIds: number[]
  attributes?: SiteProductAttribute[]
  images: SiteProductImage[]
  seo?: Record<string, string>
}

export interface SiteCategory {
  id: number
  parentId: number
  names: Record<string, string>
}

export interface SiteNamedEntity {
  id: number
  names: Record<string, string>
  parentId?: number
}

export interface SiteProductListQuery {
  query?: string
  ids?: string[]
  limit?: number
}

export interface SiteAdapter {
  ping: (__ctx: SiteContext) => Promise<void>
  listCategories: (__ctx: SiteContext) => Promise<SiteCategory[]>
  listProducts: (__ctx: SiteContext, __query?: SiteProductListQuery) => Promise<SiteNamedEntity[]>
  listAttributes: (__ctx: SiteContext) => Promise<SiteNamedEntity[]>
  listLanguages: (__ctx: SiteContext) => Promise<SiteNamedEntity[]>
  createProduct: (__ctx: SiteContext, __payload: SiteProductPayload) => Promise<{ productId: number }>
  editProduct: (__ctx: SiteContext, __payload: SiteProductPayload) => Promise<{ productId: number }>
  editQuantity: (__ctx: SiteContext, __payload: { remnantId: string, quantity: number }) => Promise<void>
  linkProduct: (__ctx: SiteContext, __payload: { remnantId: string, productId: number }) => Promise<void>
  unlinkProduct: (__ctx: SiteContext, __payload: { remnantId: string }) => Promise<void>
}
