import type {
  BarcodeDTO,
  LanguageString,
} from '@remnant/shared'
import {
  createBarcodeSchema,
  editBarcodeSchema,
  getBarcodesSchema,
  idSchema,
  printBarcodeSchema,
  removeBarcodesSchema,
} from '@remnant/shared'
import { z } from 'zod'

export interface BarcodeDB {
  _id: string
  code: string
  products: {
    _id: string
    names: LanguageString
    productProperties: {
      _id: string
      names: LanguageString
      options: string[]
      value: unknown
      optionData: {
        _id: string
        names: LanguageString
      }[]
    }[]
    categories: {
      _id: string
      names: LanguageString
    }[]
    images: {
      _id: string
      filename: string
      name: string
      type: string
      path: string
    }[]
    quantity: number
  }[]
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export type GetBarcodesPayload = z.output<typeof getBarcodesSchema>
export function parseGetBarcodes(x: unknown): GetBarcodesPayload {
  return getBarcodesSchema.parse(x)
}

export type CreateBarcodesPayload = z.output<typeof createBarcodeSchema>
export function parseCreateBarcodes(x: unknown): CreateBarcodesPayload {
  return createBarcodeSchema.parse(x)
}

export type EditBarcodesPayload = z.output<typeof editBarcodeSchema>
export function parseEditBarcodes(x: unknown): EditBarcodesPayload {
  return editBarcodeSchema.parse(x)
}

export type RemoveBarcodesPayload = z.output<typeof removeBarcodesSchema>
export function parseRemoveBarcodes(x: unknown): RemoveBarcodesPayload {
  return removeBarcodesSchema.parse(x)
}

export type PrintBarcodePayload = z.output<typeof printBarcodeSchema>
export function parsePrintBarcode(x: unknown): PrintBarcodePayload {
  return printBarcodeSchema.parse(x)
}

export type GetBarcodesRepoPayload = GetBarcodesPayload
export interface GetBarcodesRepoResult { items: BarcodeDTO[], total: number, page: number, pageSize: number }

export const createBarcodeSchemaPayload = z.object({
  code: z.string().trim().optional(),
  products: z.array(z.object({
    _id: idSchema,
    quantity: z.number().int().positive(),
  })).min(1),
  active: z.boolean().optional().default(true),
})

export type CreateBarcodesRepoPayload = z.output<typeof createBarcodeSchemaPayload>

export const editBarcodeSchemaPayload = z.object({
  code: z.string().trim().optional(),
  products: z.array(z.object({
    _id: idSchema,
    quantity: z.number().int().positive(),
  })).min(1),
  active: z.boolean().optional().default(true),
})

export type EditBarcodesRepoPayload = z.output<typeof editBarcodeSchemaPayload>
