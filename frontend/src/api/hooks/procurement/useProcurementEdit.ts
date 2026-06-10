import type { EditProcurementRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { editProcurement } from '@/api/requests'

export function useProcurementEdit(settings?: MutationSettings<EditProcurementRequest, typeof editProcurement>) {
  return useMutation({
    mutationFn: editProcurement,
    ...settings?.options,
  })
}
