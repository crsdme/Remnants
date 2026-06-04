import { z } from 'zod'

export const getSettingSchema = z.object({
  filters: z.object({
    key: z.string().trim().optional(),
    scope: z.string().trim().optional(),
  }).optional().default({}),
})

export type GetSettingRequest = z.input<typeof getSettingSchema>

export const editSettingSchema = z.object({
  key: z.string().trim(),
  value: z.any().optional().default(null),
})

export type EditSettingRequest = z.input<typeof editSettingSchema>
