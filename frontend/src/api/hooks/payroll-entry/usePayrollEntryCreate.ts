import type { CreatePayrollEntryRequest } from '@remnant/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPayrollEntry } from '@/api/requests'

export function usePayrollEntryCreate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: CreatePayrollEntryRequest) => createPayrollEntry(params),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['user-profiles'] })
    },
  })
}
