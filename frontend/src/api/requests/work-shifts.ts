import type {
  EditWorkShiftRequest,
  EditWorkShiftResponse,
  FinishWorkShiftRequest,
  FinishWorkShiftResponse,
  PlanWorkShiftRequest,
  PlanWorkShiftResponse,
  StartWorkShiftRequest,
  StartWorkShiftResponse,
  UnplanWorkShiftRequest,
  UnplanWorkShiftResponse,
} from '@remnant/shared'
import { api } from '@/api/instance'

export async function startWorkShift(params: StartWorkShiftRequest = {}) {
  return api.post<StartWorkShiftResponse>('work-shifts/start', params)
}

export async function finishWorkShift(params: FinishWorkShiftRequest = {}) {
  return api.post<FinishWorkShiftResponse>('work-shifts/finish', params)
}

export async function editWorkShift(params: EditWorkShiftRequest) {
  return api.post<EditWorkShiftResponse>('work-shifts/edit', params)
}

export async function planWorkShift(params: PlanWorkShiftRequest) {
  return api.post<PlanWorkShiftResponse>('work-shifts/plan', params)
}

export async function unplanWorkShift(params: UnplanWorkShiftRequest) {
  return api.post<UnplanWorkShiftResponse>('work-shifts/unplan', params)
}
