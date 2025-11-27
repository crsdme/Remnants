import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { dateRangeSchema, idSchema, numberFromStringSchema, paginationSchema, sorterParamsSchema } from './common'

extendZodWithOpenApi(z)

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

export const removeProcurementsSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export const getProcurementItemsSchema = z.object({
  filters: z.object({
    procurementId: z.string().trim().optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export const editProcurementSchema = z.object({
  id: idSchema,
  comment: z.string().trim().optional(),
  supplier: idSchema,
  status: z.string().trim(),
  warehouse: idSchema,
  expenses: z.array(idSchema),
  payments: z.array(idSchema),
})

export const scanBarcodeSchema = z.object({
  barcode: z.string().trim(),
  procurementId: idSchema.optional(),
})

export const payProcurementSchema = z.object({
  id: idSchema,
  procurementId: idSchema,
  cashregister: idSchema,
  account: idSchema,
  currency: idSchema,
  amount: z.number(),
  comment: z.string().trim().optional(),
})
