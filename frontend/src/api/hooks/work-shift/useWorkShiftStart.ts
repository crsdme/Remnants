import type { StartWorkShiftRequest } from '@remnant/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { startWorkShift } from '@/api/requests'

export function useWorkShiftStart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: StartWorkShiftRequest = {}) => startWorkShift(params),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['user-profiles'] })
    },
  })
}
