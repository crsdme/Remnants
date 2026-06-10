import { z } from 'zod'
import { dateRangeSchema, idSchema, numberFromStringSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema, sorterParamsSchema } from './common'
import { currencySchema } from './currency.schema'

export const procurementSchema = z.object({
  id: idSchema,
  seq: z.number(),
  supplier: idSchema,
  status: z.string().trim(),
  warehouse: idSchema,
  expenses: z.array(idSchema),
  payments: z.array(idSchema),
  itemsByCurrency: z.array(z.object({
    currency: currencySchema,
    amount: z.number(),
  })),
  paymentsByCurrency: z.array(z.object({
    currency: currencySchema,
    amount: z.number(),
  })),
  balanceByCurrency: z.array(z.object({
    currency: currencySchema,
    amount: z.number(),
  })),
  createdBy: idSchema,
  removedBy: idSchema,
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
})
export type ProcurementItemDTO = z.infer<typeof procurementItemSchema>

export const getProcurementsSchema = z.object({
  filters: z.object({
    seq: z.array(numberFromStringSchema).optional(),
    supplier: idSchema.optional(),
    status: z.string().trim().optional(),
    warehouse: idSchema.optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    supplier: sorterParamsSchema.optional(),
    status: sorterParamsSchema.optional(),
    warehouse: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetProcurementsRequest = z.input<typeof getProcurementsSchema>

export const createProcurementSchema = z.object({
  comment: z.string().trim().optional(),
  items: z.array(z.object({
    id: idSchema,
    quantity: z.number(),
    purchasePrice: z.number().min(0),
    purchaseCurrency: z.object({
      id: idSchema,
    }),
  })),
  supplier: idSchema,
})

export type CreateProcurementRequest = z.input<typeof createProcurementSchema>

export const removeProcurementsSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveProcurementsRequest = z.input<typeof removeProcurementsSchema>

export const getProcurementItemsSchema = z.object({
  filters: z.object({
    procurementId: z.string().trim().optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetProcurementItemsRequest = z.input<typeof getProcurementItemsSchema>

export const editProcurementSchema = z.object({
  id: idSchema,
  comment: z.string().trim().optional(),
  supplier: idSchema,
  status: z.string().trim(),
  warehouse: idSchema,
  expenses: z.array(idSchema),
  payments: z.array(idSchema),
})

export type EditProcurementRequest = z.input<typeof editProcurementSchema>

export const scanBarcodeSchema = z.object({
  barcode: z.string().trim(),
  procurementId: idSchema.optional(),
})

export type ScanBarcodeProcurementRequest = z.input<typeof scanBarcodeSchema>

export const payProcurementSchema = z.object({
  id: idSchema,
  procurementId: idSchema,
  cashregister: idSchema,
  account: idSchema,
  currency: idSchema,
  amount: z.number(),
  comment: z.string().trim().optional(),
})

export type PayProcurementRequest = z.input<typeof payProcurementSchema>

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

export const scanBarcodeProcurementResponseSchema = responseSchema
export type ScanBarcodeProcurementResponse = z.infer<typeof scanBarcodeProcurementResponseSchema>

export const payProcurementResponseSchema = responseSchema
export type PayProcurementResponse = z.infer<typeof payProcurementResponseSchema>
