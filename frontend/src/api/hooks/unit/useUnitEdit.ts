import type { editUnitParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { editUnit } from '@/api/requests'

export function useUnitEdit(settings?: MutationSettings<editUnitParams, typeof editUnit>) {
  return useMutation({
    mutationFn: editUnit,
    ...settings?.options,
  })
}
