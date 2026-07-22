import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, idSchemaOptional, languageStringSchema, numberFromStringSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema, sorterParamsSchema } from './common'
import { productPropertySchema } from './product-property.schema'

export const productPropertyGroupSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  productProperties: z.array(idSchema),
  priority: z.number(),
  active: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ProductPropertyGroupDTO = z.output<typeof productPropertyGroupSchema>

export const productPropertyGroupPopulatedSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  productProperties: z.array(productPropertySchema),
  priority: z.number(),
  active: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ProductPropertyGroupPopulatedDTO = z.output<typeof productPropertyGroupPopulatedSchema>

export const getProductPropertyGroupSchema = z.object({
  filters: z.object({
    names: z.string().trim().optional(),
    language: z.string().optional().default('en'),
    productProperties: idSchemaOptional,
    active: booleanArraySchema.optional(),
    priority: numberFromStringSchema.optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    names: sorterParamsSchema.optional(),
    active: sorterParamsSchema.optional(),
    priority: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetProductPropertyGroupRequest = z.input<typeof getProductPropertyGroupSchema>

export const createProductPropertyGroupSchema = z.object({
  names: languageStringSchema,
  productProperties: z.array(idSchema).optional(),
  priority: z.number().optional().default(0),
  active: z.boolean().optional().default(true),
})

export type CreateProductPropertyGroupRequest = z.input<typeof createProductPropertyGroupSchema>

export const editProductPropertyGroupSchema = z.object({
  id: idSchema,
  names: languageStringSchema,
  productProperties: z.array(idSchema).optional(),
  priority: z.number().optional().default(0),
  active: z.boolean().optional().default(true),
})

export type EditProductPropertyGroupRequest = z.input<typeof editProductPropertyGroupSchema>

export const removeProductPropertyGroupSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveProductPropertyGroupRequest = z.input<typeof removeProductPropertyGroupSchema>

export const getProductPropertyGroupsResponseSchema = responseListSchema(productPropertyGroupPopulatedSchema)
export type GetProductPropertyGroupsResponse = z.output<typeof getProductPropertyGroupsResponseSchema>

export const createProductPropertyGroupResponseSchema = responseItemSchema(productPropertyGroupSchema)
export type CreateProductPropertyGroupResponse = z.output<typeof createProductPropertyGroupResponseSchema>

export const editProductPropertyGroupResponseSchema = responseItemSchema(productPropertyGroupSchema)
export type EditProductPropertyGroupResponse = z.output<typeof editProductPropertyGroupResponseSchema>

export const removeProductPropertyGroupsResponseSchema = responseSchema
export type RemoveProductPropertyGroupsResponse = z.output<typeof removeProductPropertyGroupsResponseSchema>
