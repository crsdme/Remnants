import { idSchema } from '@remnant/shared'
import { z } from 'zod'
import { productDBPopulatedSchema } from './product.schema'

export const barcodeDBSchema = z.object({
  _id: idSchema,
  seq: z.number(),
  code: z.string().trim(),
  products: z.array(z.object({
    _id: idSchema,
    unitsPerScan: z.number().int().positive(),
  })),
  active: z.boolean().optional().default(true),
  removed: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const barcodeDBPopulatedSchema = z.object({
  id: idSchema,
  seq: z.number().optional(),
  code: z.string().trim(),
  products: z.array(productDBPopulatedSchema.omit({ _id: true }).extend({
    id: idSchema,
    unitsPerScan: z.number().int().positive(),
  })),
  active: z.boolean().optional().default(true),
  removed: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const createBarcodeRepoSchema = z.object({
  code: z.string().trim().optional(),
  products: z.array(z.object({
    _id: idSchema,
    unitsPerScan: z.number().int().positive(),
  })).min(1),
  active: z.boolean().optional().default(true),
})

export const editBarcodeRepoSchema = z.object({
  code: z.string().trim().optional(),
  products: z.array(z.object({
    _id: idSchema,
    unitsPerScan: z.number().int().positive(),
  })).min(1),
  active: z.boolean().optional().default(true),
})
