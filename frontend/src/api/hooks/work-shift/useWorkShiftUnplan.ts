import type { UnplanWorkShiftRequest } from '@remnant/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { unplanWorkShift } from '@/api/requests'

export function useWorkShiftUnplan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: UnplanWorkShiftRequest) => unplanWorkShift(params),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['user-profiles'] })
    },
  })
}
