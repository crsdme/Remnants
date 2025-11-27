import type { editProcurementsParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { editProcurement } from '@/api/requests'

export function useProcurementEdit(settings?: MutationSettings<editProcurementsParams, typeof editProcurement>) {
  return useMutation({
    mutationFn: editProcurement,
    ...settings?.options,
  })
}
