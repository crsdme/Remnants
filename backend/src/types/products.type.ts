import type {
  importProductsSchema,
  LanguageString,
  ProductPopulatedDTO,
} from '@remnant/shared'
import type { z } from 'zod'
import type { createProductRepoSchema, editProductRepoSchema } from '@/schemas/'
import {
  batchProductSchema,
  createProductSchema,
  editProductSchema,
  exportProductsSchema,
  getProductIndexSchema,
  getProductSchema,
  removeProductSchema,
} from '@remnant/shared'
import { getProductRepoSchema } from '@/schemas/'

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
  productPropertiesGroup: string
  productProperties: {
    _id: string
    value: unknown
  }[]
  quantityIds: string[]
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ImportProduct {
  id: string | undefined
  names: Record<string, string>
  price: string
  currency: string
  purchasePrice: string
  purchaseCurrency: string
  barcodes: string[]
  categories: string[]
  unit: string
  productPropertiesGroup: string
  productProperties: { _id: string, value: unknown }[]
  images: { filename: string, name: string, type: string, path: string }[]
  uploadedImages: { filename: string, name: string, type: string, path: string }[]
  generateBarcode: boolean
}

export interface ProductPopulated extends Omit<ProductDB, 'currency' | 'purchaseCurrency' | 'unit' | 'productPropertiesGroup' | 'productProperties' | 'barcodes' | 'categories' | 'quantityIds'> {
  currency: {
    _id: string
    names: LanguageString
    symbols: LanguageString
  }
  purchaseCurrency: {
    _id: string
    names: LanguageString
    symbols: LanguageString
  }
  unit: {
    _id: string
    names: LanguageString
    symbols: LanguageString
  }
  productPropertiesGroup: {
    _id: string
    names: LanguageString
  }
  productProperties: {
    _id: string
    options: {
      _id: string
      names: LanguageString
    }[]
    value: unknown
  }[]
  barcodes: {
    _id: string
    code: string
  }[]
  warehouseStock: {
    _id: string
    count: number
    warehouse: string
  }[]
  categories: {
    _id: string
    names: LanguageString
  }[]
}

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

export type ImportProductsPayload = z.output<typeof importProductsSchema> & { file: Express.Multer.File }

export type ExportProductsPayload = z.output<typeof exportProductsSchema>
export function parseExportProducts(x: unknown): ExportProductsPayload {
  return exportProductsSchema.parse(x)
}

export type GetProductsRepoPayload = z.output<typeof getProductRepoSchema>
export function parseGetProductsRepo(x: unknown): GetProductsRepoPayload {
  return getProductRepoSchema.parse(x)
}

export interface GetProductsRepoResult { items: ProductPopulatedDTO[], total: number, page: number, pageSize: number }

export type CreateProductsRepoPayload = z.output<typeof createProductRepoSchema>

export type EditProductsRepoPayload = z.output<typeof editProductRepoSchema>

export type GetProductsIndexRepoPayload = GetProductsIndexPayload
