import { z } from 'zod'
import {
  dateRangeSchema,
  idSchema,
  idSchemaOptional,
  paginationSchema,
  responseItemSchema,
  responseListSchema,
  sorterParamsSchema,
} from './common'
import { workScheduleSchema } from './user-profile.schema'

export const workDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD')

export const workShiftStatusSchema = z.enum(['planned', 'started', 'completed', 'absent'])
export type WorkShiftStatus = z.output<typeof workShiftStatusSchema>

export const workShiftSchema = z.object({
  id: idSchema,
  userId: idSchema,
  workDate: workDateSchema,
  status: workShiftStatusSchema,
  startedAt: z.coerce.date().nullable().optional(),
  finishedAt: z.coerce.date().nullable().optional(),
  plannedSchedule: workScheduleSchema.nullable().optional(),
  earlyBonusMinor: z.number().default(0),
  latePenaltyMinor: z.number().default(0),
  salaryMinor: z.number().default(0),
  markedByUserId: idSchemaOptional,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type WorkShiftDTO = z.output<typeof workShiftSchema>

export const getWorkShiftsSchema = z.object({
  filters: z.object({
    userId: idSchemaOptional,
    userIds: z.array(idSchema).optional(),
    workDate: dateRangeSchema.optional(),
    status: z.array(workShiftStatusSchema).optional(),
  }).optional().default({}),
  sorters: z.object({
    workDate: sorterParamsSchema.optional(),
    startedAt: sorterParamsSchema.optional(),
    createdAt: sorterParamsSchema.optional(),
  }).optional().default({}),
  pagination: paginationSchema.optional().default({}),
})
export type GetWorkShiftsRequest = z.input<typeof getWorkShiftsSchema>

export const startWorkShiftSchema = z.object({
  userId: idSchemaOptional,
  workDate: workDateSchema.optional(),
  startedAt: z.coerce.date().optional(),
})
export type StartWorkShiftRequest = z.input<typeof startWorkShiftSchema>

export const finishWorkShiftSchema = z.object({
  id: idSchemaOptional,
  userId: idSchemaOptional,
  workDate: workDateSchema.optional(),
  finishedAt: z.coerce.date().optional(),
})
export type FinishWorkShiftRequest = z.input<typeof finishWorkShiftSchema>

export const editWorkShiftSchema = z.object({
  id: idSchema,
  startedAt: z.coerce.date().nullable().optional(),
  finishedAt: z.coerce.date().nullable().optional(),
  status: workShiftStatusSchema.optional(),
  plannedSchedule: workScheduleSchema.nullable().optional(),
})
export type EditWorkShiftRequest = z.input<typeof editWorkShiftSchema>

export const planWorkShiftSchema = z.object({
  userId: idSchema,
  workDate: workDateSchema,
  plannedSchedule: workScheduleSchema.nullable().optional(),
})
export type PlanWorkShiftRequest = z.input<typeof planWorkShiftSchema>

export const unplanWorkShiftSchema = z.object({
  id: idSchemaOptional,
  userId: idSchemaOptional,
  workDate: workDateSchema.optional(),
})
export type UnplanWorkShiftRequest = z.input<typeof unplanWorkShiftSchema>

export const getWorkShiftsResponseSchema = responseListSchema(workShiftSchema)
export type GetWorkShiftsResponse = z.output<typeof getWorkShiftsResponseSchema>

export const startWorkShiftResponseSchema = responseItemSchema(workShiftSchema)
export type StartWorkShiftResponse = z.output<typeof startWorkShiftResponseSchema>

export const finishWorkShiftResponseSchema = responseItemSchema(workShiftSchema)
export type FinishWorkShiftResponse = z.output<typeof finishWorkShiftResponseSchema>

export const editWorkShiftResponseSchema = responseItemSchema(workShiftSchema)
export type EditWorkShiftResponse = z.output<typeof editWorkShiftResponseSchema>

export const planWorkShiftResponseSchema = responseItemSchema(workShiftSchema)
export type PlanWorkShiftResponse = z.output<typeof planWorkShiftResponseSchema>

export const unplanWorkShiftResponseSchema = responseItemSchema(workShiftSchema)
export type UnplanWorkShiftResponse = z.output<typeof unplanWorkShiftResponseSchema>
