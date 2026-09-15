import type { FinishWorkShiftRequest } from '@remnant/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { finishWorkShift } from '@/api/requests'

export function useWorkShiftFinish() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: FinishWorkShiftRequest = {}) => finishWorkShift(params),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['user-profiles'] })
    },
  })
}
