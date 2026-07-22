import type {
  getBarcodeByCodeSchema,
} from '@remnant/shared'
import type { z } from 'zod'
import type {
  barcodeDBPopulatedSchema,
  barcodeDBSchema,
  createBarcodeRepoSchema,
  editBarcodeRepoSchema,
} from '@/schemas/'
import {
  createBarcodeSchema,
  editBarcodeSchema,
  getBarcodesSchema,
  printBarcodeSchema,
  removeBarcodesSchema,
} from '@remnant/shared'

export type BarcodeDB = z.infer<typeof barcodeDBSchema>

export type BarcodeDBPopulated = z.infer<typeof barcodeDBPopulatedSchema>

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
export interface GetBarcodesRepoResult { items: BarcodeDBPopulated[], total: number, page: number, pageSize: number }

export type CreateBarcodesRepoPayload = z.output<typeof createBarcodeRepoSchema>

export type EditBarcodesRepoPayload = z.output<typeof editBarcodeRepoSchema>

export type GetBarcodeByCodePayload = z.output<typeof getBarcodeByCodeSchema>

export type GetBarcodeByCodeRepoPayload = GetBarcodeByCodePayload
export interface GetBarcodeByCodeRepoResult { items: BarcodeDBPopulated[], total: number, page: number, pageSize: number }
