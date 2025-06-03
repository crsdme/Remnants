import type { editUnitParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { editUnit } from '@/api/requests'

export function useEditUnit(settings?: MutationSettings<editUnitParams, typeof editUnit>) {
  return useMutation({
    mutationFn: (params: editUnitParams) => editUnit(params),
    ...settings?.options,
  })
}
