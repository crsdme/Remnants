import type {
  batchProductSchema,
  editProductSchema,
  exportProductsSchema,
  importProductsSchema,
  removeProductSchema,
} from '@remnant/shared'
import type { z } from 'zod'
import type {
  createProductRepoSchema,
  editProductRepoSchema,
  productDBPopulatedSchema,
  productDBSchema,
} from '@/schemas/'
import {
  createProductSchema,
  getProductIndexSchema,
  getProductSchema,
} from '@remnant/shared'
import { getProductRepoSchema } from '@/schemas/'

export type ProductDB = z.infer<typeof productDBSchema>

export type ProductDBPopulated = z.infer<typeof productDBPopulatedSchema>

export type GetProductsPayload = z.output<typeof getProductSchema>
export function parseGetProducts(x: unknown): GetProductsPayload {
  return getProductSchema.parse(x)
}

export type GetProductsIndexPayload = z.output<typeof getProductIndexSchema>
export function parseGetProductsIndex(x: unknown): GetProductsIndexPayload {
  return getProductIndexSchema.parse(x)
}

export type CreateProductsPayload = z.output<typeof createProductSchema>
export function parseCreateProducts(x: unknown): CreateProductsPayload {
  return createProductSchema.parse(x)
}

export type EditProductsPayload = z.output<typeof editProductSchema>

export type RemoveProductsPayload = z.output<typeof removeProductSchema>

export type BatchProductsPayload = z.output<typeof batchProductSchema>

export type ImportProductsPayload = z.output<typeof importProductsSchema> & { file: Express.Multer.File }

export type ExportProductsPayload = z.output<typeof exportProductsSchema>

export type GetProductsRepoPayload = z.output<typeof getProductRepoSchema>
export function parseGetProductsRepo(x: unknown): GetProductsRepoPayload {
  return getProductRepoSchema.parse(x)
}

export interface GetProductsRepoResult { items: ProductDBPopulated[], total: number, page: number, pageSize: number }

export type CreateProductsRepoPayload = z.output<typeof createProductRepoSchema>

export type EditProductsRepoPayload = z.output<typeof editProductRepoSchema>

export type GetProductsIndexRepoPayload = GetProductsIndexPayload
