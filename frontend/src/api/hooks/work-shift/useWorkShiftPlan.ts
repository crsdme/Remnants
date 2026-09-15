import type { PlanWorkShiftRequest } from '@remnant/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { planWorkShift } from '@/api/requests'

export function useWorkShiftPlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: PlanWorkShiftRequest) => planWorkShift(params),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['user-profiles'] })
    },
  })
}
