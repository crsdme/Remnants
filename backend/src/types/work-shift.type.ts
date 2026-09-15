import type { z } from 'zod'
import type { workShiftDBSchema } from '../schemas'
import {
  editWorkShiftSchema,
  finishWorkShiftSchema,
  getWorkShiftsSchema,
  planWorkShiftSchema,
  startWorkShiftSchema,
  unplanWorkShiftSchema,
} from '@remnant/shared'

export type WorkShiftDB = z.infer<typeof workShiftDBSchema>

export type GetWorkShiftsPayload = z.output<typeof getWorkShiftsSchema>
export function parseGetWorkShifts(x: unknown): GetWorkShiftsPayload {
  return getWorkShiftsSchema.parse(x)
}

export type StartWorkShiftPayload = z.output<typeof startWorkShiftSchema>
export function parseStartWorkShift(x: unknown): StartWorkShiftPayload {
  return startWorkShiftSchema.parse(x)
}

export type FinishWorkShiftPayload = z.output<typeof finishWorkShiftSchema>
export function parseFinishWorkShift(x: unknown): FinishWorkShiftPayload {
  return finishWorkShiftSchema.parse(x)
}

export type EditWorkShiftPayload = z.output<typeof editWorkShiftSchema>
export function parseEditWorkShift(x: unknown): EditWorkShiftPayload {
  return editWorkShiftSchema.parse(x)
}

export type PlanWorkShiftPayload = z.output<typeof planWorkShiftSchema>
export function parsePlanWorkShift(x: unknown): PlanWorkShiftPayload {
  return planWorkShiftSchema.parse(x)
}

export type UnplanWorkShiftPayload = z.output<typeof unplanWorkShiftSchema>
export function parseUnplanWorkShift(x: unknown): UnplanWorkShiftPayload {
  return unplanWorkShiftSchema.parse(x)
}

export interface GetWorkShiftsRepoResult {
  items: WorkShiftDB[]
  total: number
  page: number
  pageSize: number
}
