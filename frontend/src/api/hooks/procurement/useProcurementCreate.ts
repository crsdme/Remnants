import type { CreateProcurementRequest } from '@remnant/shared'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createProcurement } from '@/api/requests'

export function useProcurementCreate(settings?: MutationSettings<CreateProcurementRequest, typeof createProcurement>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProcurement,
    ...settings?.options,
    onSuccess: async (...args) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['procurements'] }),
        queryClient.invalidateQueries({ queryKey: ['suppliers'], refetchType: 'all' }),
      ])
      return settings?.options?.onSuccess?.(...args)
    },
  })
}
