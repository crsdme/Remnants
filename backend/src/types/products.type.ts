import type {
  AuthUser,
  LanguageString,
  ProductDTO,
} from '@remnant/shared'
import type { z } from 'zod'
import {
  batchProductSchema,
  createProductSchema,
  editProductSchema,
  exportProductsSchema,
  getProductSchema,
  importProductsSchema,
  removeProductSchema,
} from '@remnant/shared'

export interface ProductDB {
  _id: string
  seq: number
  names: LanguageString
  price: number
  currency: string
  purchasePrice: number
  purchaseCurrency: string
  barcodes: string[]
  categories: string[]
  unit: string
  images: {
    _id: string
    filename: string
    name: string
    type: string
    path: string
  }[]
}

export type GetProductsPayload = z.output<typeof getProductSchema>
export function parseGetProducts(x: unknown): GetProductsPayload {
  return getProductSchema.parse(x)
}

export type CreateProductsPayload = z.output<typeof createProductSchema>
export function parseCreateProducts(x: unknown): CreateProductsPayload {
  return createProductSchema.parse(x)
}

export type EditProductsPayload = z.output<typeof editProductSchema>
export function parseEditProducts(x: unknown): EditProductsPayload {
  return editProductSchema.parse(x)
}

export type RemoveProductsPayload = z.output<typeof removeProductSchema>
export function parseRemoveProducts(x: unknown): RemoveProductsPayload {
  return removeProductSchema.parse(x)
}

export type BatchProductsPayload = z.output<typeof batchProductSchema>
export function parseBatchProducts(x: unknown): BatchProductsPayload {
  return batchProductSchema.parse(x)
}

export type ImportProductsPayload = z.output<typeof importProductsSchema>
export function parseImportProducts(x: unknown): ImportProductsPayload {
  return importProductsSchema.parse(x)
}

export type ExportProductsPayload = z.output<typeof exportProductsSchema>
export function parseExportProducts(x: unknown): ExportProductsPayload {
  return exportProductsSchema.parse(x)
}

export type GetProductsRepoPayload = GetProductsPayload & { user: AuthUser }
export interface GetProductsRepoResult { items: ProductDTO[], total: number, page: number, pageSize: number }

export type CreateProductsRepoPayload = CreateProductsPayload

export type EditProductsRepoPayload = EditProductsPayload
