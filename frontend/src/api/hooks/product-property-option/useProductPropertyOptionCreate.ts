import type { createProductPropertiesOptionParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { createProductPropertyOption } from '@/api/requests'

export function useProductPropertyOptionCreate(settings?: MutationSettings<createProductPropertiesOptionParams, typeof createProductPropertyOption>) {
  return useMutation({
    mutationFn: createProductPropertyOption,
    ...settings?.options,
  })
}
