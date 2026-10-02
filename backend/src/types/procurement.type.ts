import type {
  ProcurementDTO,
  ProcurementItemDTO,
} from '@remnant/shared'
import type { z } from 'zod'
import type { procurementDBSchema, procurementItemDBSchema } from '../schemas'
import {
  cancelProcurementPaymentSchema,
  confirmProcurementSchema,
  createProcurementSchema,
  editProcurementSchema,
  getProcurementItemsSchema,
  getProcurementsSchema,
  payProcurementSchema,
  paySupplierSchema,
  removeProcurementsSchema,
  scanBarcodeSchema,
  unconfirmProcurementSchema,
} from '@remnant/shared'

export type ProcurementDB = z.infer<typeof procurementDBSchema>
export type ProcurementItemDB = z.infer<typeof procurementItemDBSchema>

export type GetProcurementsPayload = z.output<typeof getProcurementsSchema>
export function parseGetProcurements(x: unknown): GetProcurementsPayload {
  return getProcurementsSchema.parse(x)
}

export type CreateProcurementPayload = z.output<typeof createProcurementSchema>
export function parseCreateProcurement(x: unknown): CreateProcurementPayload {
  return createProcurementSchema.parse(x)
}

export type EditProcurementPayload = z.output<typeof editProcurementSchema>
export function parseEditProcurement(x: unknown): EditProcurementPayload {
  return editProcurementSchema.parse(x)
}

export type RemoveProcurementsPayload = z.output<typeof removeProcurementsSchema>
export function parseRemoveProcurements(x: unknown): RemoveProcurementsPayload {
  return removeProcurementsSchema.parse(x)
}

export type GetProcurementItemsPayload = z.output<typeof getProcurementItemsSchema>
export function parseGetProcurementItems(x: unknown): GetProcurementItemsPayload {
  return getProcurementItemsSchema.parse(x)
}

export type PayProcurementPayload = z.output<typeof payProcurementSchema>
export function parsePayProcurement(x: unknown): PayProcurementPayload {
  return payProcurementSchema.parse(x)
}

export type CancelProcurementPaymentPayload = z.output<typeof cancelProcurementPaymentSchema>
export function parseCancelProcurementPayment(x: unknown): CancelProcurementPaymentPayload {
  return cancelProcurementPaymentSchema.parse(x)
}

export type PaySupplierPayload = z.output<typeof paySupplierSchema>
export function parsePaySupplier(x: unknown): PaySupplierPayload {
  return paySupplierSchema.parse(x)
}

export type ConfirmProcurementPayload = z.output<typeof confirmProcurementSchema>
export function parseConfirmProcurement(x: unknown): ConfirmProcurementPayload {
  return confirmProcurementSchema.parse(x)
}

export type UnconfirmProcurementPayload = z.output<typeof unconfirmProcurementSchema>
export function parseUnconfirmProcurement(x: unknown): UnconfirmProcurementPayload {
  return unconfirmProcurementSchema.parse(x)
}

export type ScanBarcodeProcurementPayload = z.output<typeof scanBarcodeSchema>
export function parseScanBarcodeProcurement(x: unknown): ScanBarcodeProcurementPayload {
  return scanBarcodeSchema.parse(x)
}

export type GetProcurementsRepoPayload = GetProcurementsPayload
export interface GetProcurementsRepoResult {
  items: ProcurementDTO[]
  total: number
  page: number
  pageSize: number
}

export type GetProcurementItemsRepoPayload = GetProcurementItemsPayload
export interface GetProcurementItemsRepoResult {
  items: ProcurementItemDTO[]
  total: number
  page: number
  pageSize: number
}

export interface CreateProcurementRepoPayload {
  supplierId: string
  warehouseId?: string | null
  comment?: string
  createdBy: string
  status?: string
  paymentStatus?: string
  removed?: boolean
}

export interface CreateProcurementItemRepoPayload {
  procurementId: string
  productId: string
  quantity: number
  receivedQuantity?: number
  minorPurchasePrice: number
  purchaseCurrencyId: string
}
