import { z } from 'zod'
import { barcodeDTOPopulatedSchema } from './barcode.schema'
import { dateRangeSchema, idSchema, idSchemaOptional, languageStringSchema, numberFromStringSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema, sorterParamsSchema } from './common'

export const procurementStatusSchema = z.enum([
  'draft',
  'ordered',
  'partially-received',
  'received',
  'closed',
  'cancelled',
])
export type ProcurementStatus = z.output<typeof procurementStatusSchema>

export const procurementPaymentStatusSchema = z.enum([
  'unpaid',
  'partially-paid',
  'paid',
  'overpaid',
])
export type ProcurementPaymentStatus = z.output<typeof procurementPaymentStatusSchema>

const procurementCurrencyAmountSchema = z.object({
  currency: z.object({
    id: idSchema,
    names: languageStringSchema,
    symbols: languageStringSchema,
    scale: z.number().optional(),
  }),
  amount: z.number(),
})

export const procurementSchema = z.object({
  id: idSchema,
  seq: z.number(),
  supplierId: idSchema,
  supplier: z.object({
    id: idSchema,
    seq: z.number().optional(),
    name: z.string(),
  }).optional(),
  status: z.string().trim(),
  paymentStatus: z.string().trim().optional(),
  warehouseId: idSchema.optional().nullable(),
  warehouse: z.object({
    id: idSchema,
    names: languageStringSchema,
  }).optional().nullable(),
  expenseIds: z.array(idSchema).optional().default([]),
  paymentIds: z.array(idSchema).optional().default([]),
  itemsByCurrency: z.array(procurementCurrencyAmountSchema).optional().default([]),
  paymentsByCurrency: z.array(procurementCurrencyAmountSchema).optional().default([]),
  balanceByCurrency: z.array(procurementCurrencyAmountSchema).optional().default([]),
  createdBy: idSchemaOptional,
  removedBy: idSchema.optional().nullable(),
  comment: z.string().trim().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type ProcurementDTO = z.infer<typeof procurementSchema>

export const procurementItemSchema = z.object({
  id: idSchema,
  procurementId: idSchema,
  productId: idSchema,
  quantity: z.number(),
  receivedQuantity: z.number().optional().default(0),
  minorPurchasePrice: z.number().int().optional(),
  purchasePrice: z.number().optional(),
  purchaseCurrencyId: idSchema.optional(),
  product: z.object({
    id: idSchema,
    names: languageStringSchema,
  }).optional(),
})
export type ProcurementItemDTO = z.infer<typeof procurementItemSchema>

export const getProcurementsSchema = z.object({
  filters: z.object({
    ids: z.array(idSchema).optional(),
    seq: z.array(numberFromStringSchema).optional(),
    supplierId: idSchemaOptional,
    status: z.string().trim().optional(),
    paymentStatus: z.string().trim().optional(),
    warehouseId: idSchemaOptional,
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    supplierId: sorterParamsSchema.optional(),
    status: sorterParamsSchema.optional(),
    warehouseId: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetProcurementsRequest = z.input<typeof getProcurementsSchema>

export const createProcurementSchema = z.object({
  comment: z.string().trim().optional(),
  warehouseId: idSchemaOptional,
  items: z.array(z.object({
    id: idSchema,
    quantity: z.number(),
    purchasePrice: z.number().min(0),
    purchaseCurrencyId: z.object({
      id: idSchema,
    }),
  })),
  supplierId: idSchema,
})

export type CreateProcurementRequest = z.input<typeof createProcurementSchema>

export const removeProcurementsSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveProcurementsRequest = z.input<typeof removeProcurementsSchema>

export const getProcurementItemsSchema = z.object({
  filters: z.object({
    procurementId: idSchemaOptional,
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetProcurementItemsRequest = z.input<typeof getProcurementItemsSchema>

export const editProcurementSchema = z.object({
  id: idSchema,
  comment: z.string().trim().optional(),
  supplierId: idSchema.optional(),
  status: z.string().trim().optional(),
  warehouseId: idSchemaOptional,
  items: z.array(z.object({
    id: idSchema,
    quantity: z.number(),
    purchasePrice: z.number().min(0),
    purchaseCurrencyId: z.object({
      id: idSchema,
    }),
  })).optional(),
})

export type EditProcurementRequest = z.input<typeof editProcurementSchema>

export const scanBarcodeSchema = z.object({
  barcode: z.string().trim(),
  procurementId: idSchemaOptional,
})

export type ScanBarcodeProcurementRequest = z.input<typeof scanBarcodeSchema>

export const payProcurementSchema = z.object({
  id: idSchema.optional(),
  procurementId: idSchema,
  cashregister: idSchema.optional(),
  account: idSchema.optional(),
  currency: idSchema,
  amount: z.number().positive().optional(),
  comment: z.string().trim().optional(),
}).refine(data => data.amount == null || (Boolean(data.cashregister) && Boolean(data.account)), {
  message: 'Cashregister and account are required when paying from cash',
  path: ['cashregister'],
})

export type PayProcurementRequest = z.input<typeof payProcurementSchema>

export const cancelProcurementPaymentSchema = z.object({
  applicationId: idSchema,
})

export type CancelProcurementPaymentRequest = z.input<typeof cancelProcurementPaymentSchema>

export const paySupplierSchema = z.object({
  supplierId: idSchema,
  cashregister: idSchema.optional(),
  account: idSchema.optional(),
  currency: idSchema,
  amount: z.number().positive().optional(),
  comment: z.string().trim().optional(),
}).refine(data => data.amount == null || (Boolean(data.cashregister) && Boolean(data.account)), {
  message: 'Cashregister and account are required when paying from cash',
  path: ['cashregister'],
})

export type PaySupplierRequest = z.input<typeof paySupplierSchema>

export const confirmProcurementSchema = z.object({
  id: idSchema,
  warehouseId: idSchemaOptional,
})

export type ConfirmProcurementRequest = z.input<typeof confirmProcurementSchema>

export const unconfirmProcurementSchema = z.object({
  id: idSchema,
})

export type UnconfirmProcurementRequest = z.input<typeof unconfirmProcurementSchema>

export const getProcurementsResponseSchema = responseListSchema(procurementSchema)
export type GetProcurementsResponse = z.infer<typeof getProcurementsResponseSchema>

export const createProcurementResponseSchema = responseItemSchema(procurementSchema)
export type CreateProcurementResponse = z.infer<typeof createProcurementResponseSchema>

export const editProcurementResponseSchema = responseItemSchema(procurementSchema)
export type EditProcurementResponse = z.infer<typeof editProcurementResponseSchema>

export const removeProcurementsResponseSchema = responseSchema
export type RemoveProcurementsResponse = z.infer<typeof removeProcurementsResponseSchema>

export const getProcurementItemsResponseSchema = responseListSchema(procurementItemSchema)
export type GetProcurementItemsResponse = z.infer<typeof getProcurementItemsResponseSchema>

export const scanBarcodeProcurementResponseSchema = responseSchema.extend({
  item: barcodeDTOPopulatedSchema.optional(),
  procurementId: idSchemaOptional,
})
export type ScanBarcodeProcurementResponse = z.infer<typeof scanBarcodeProcurementResponseSchema>

export const payProcurementResponseSchema = responseItemSchema(procurementSchema)
export type PayProcurementResponse = z.infer<typeof payProcurementResponseSchema>

export const cancelProcurementPaymentResponseSchema = responseItemSchema(procurementSchema)
export type CancelProcurementPaymentResponse = z.infer<typeof cancelProcurementPaymentResponseSchema>

export const paySupplierResponseSchema = responseListSchema(procurementSchema)
export type PaySupplierResponse = z.infer<typeof paySupplierResponseSchema>

export const confirmProcurementResponseSchema = responseItemSchema(procurementSchema)
export type ConfirmProcurementResponse = z.infer<typeof confirmProcurementResponseSchema>

export const unconfirmProcurementResponseSchema = responseItemSchema(procurementSchema)
export type UnconfirmProcurementResponse = z.infer<typeof unconfirmProcurementResponseSchema>
