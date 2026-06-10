import type { EditUnitRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { editUnit } from '@/api/requests'

export function useUnitEdit(settings?: MutationSettings<EditUnitRequest>) {
  return useMutation({
    mutationFn: editUnit,
    ...settings?.options,
  })
}
