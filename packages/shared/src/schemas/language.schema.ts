import { z } from 'zod'
import { booleanArraySchema, dateRangeSchema, idSchema, numberFromStringSchema, paginationSchema, responseItemSchema, responseListSchema, responseSchema, sorterParamsSchema } from './common'

export const languageSchema = z.object({
  id: idSchema,
  seq: z.number(),
  name: z.string().trim(),
  code: z.string().trim(),
  priority: z.number().optional().default(0),
  main: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type LanguageDTO = z.infer<typeof languageSchema>

export const getLanguageSchema = z.object({
  filters: z.object({
    name: z.string().trim().optional(),
    code: z.string().trim().optional(),
    priority: numberFromStringSchema.optional(),
    createdAt: dateRangeSchema.optional(),
    updatedAt: dateRangeSchema.optional(),
    active: booleanArraySchema.optional(),
    main: booleanArraySchema.optional(),
  }).optional().default({}),
  sorters: z.object({
    name: sorterParamsSchema.optional(),
    code: sorterParamsSchema.optional(),
    priority: sorterParamsSchema.optional(),
    main: sorterParamsSchema.optional(),
    active: sorterParamsSchema.optional(),
    updatedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})

export type GetLanguagesRequest = z.input<typeof getLanguageSchema>

export const createLanguageSchema = z.object({
  name: z.string().trim(),
  code: z.string().trim(),
  priority: z.number().optional().default(0),
  main: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
})

export type CreateLanguageRequest = z.input<typeof createLanguageSchema>

export const editLanguageSchema = z.object({
  id: idSchema,
  name: z.string().trim(),
  code: z.string().trim(),
  priority: z.number().optional().default(0),
  main: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
})

export type EditLanguageRequest = z.input<typeof editLanguageSchema>

export const removeLanguageSchema = z.object({
  ids: z.array(idSchema).min(1),
})

export type RemoveLanguageRequest = z.input<typeof removeLanguageSchema>

export const getLanguagesResponseSchema = responseListSchema(languageSchema)
export type GetLanguageResponse = z.output<typeof getLanguagesResponseSchema>

export const createLanguageResponseSchema = responseItemSchema(languageSchema)
export type CreateLanguageResponse = z.output<typeof createLanguageResponseSchema>

export const editLanguageResponseSchema = responseItemSchema(languageSchema)
export type EditLanguageResponse = z.output<typeof editLanguageResponseSchema>

export const removeLanguageResponseSchema = responseSchema
export type RemoveLanguageResponse = z.output<typeof removeLanguageResponseSchema>
