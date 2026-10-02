import type { EditProcurementRequest } from '@remnant/shared'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { editProcurement } from '@/api/requests'

export function useProcurementEdit(settings?: MutationSettings<EditProcurementRequest, typeof editProcurement>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: editProcurement,
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
