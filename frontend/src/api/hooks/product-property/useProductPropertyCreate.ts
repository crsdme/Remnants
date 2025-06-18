import type { createProductPropertiesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { createProductProperty } from '@/api/requests'

export function useProductPropertyCreate(settings?: MutationSettings<createProductPropertiesParams, typeof createProductProperty>) {
  return useMutation({
    mutationFn: createProductProperty,
    ...settings?.options,
  })
}
