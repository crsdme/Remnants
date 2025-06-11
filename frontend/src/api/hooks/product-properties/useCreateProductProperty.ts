import type { createProductPropertiesParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { createProductProperty } from '@/api/requests'

export function useCreateProductProperty(settings?: MutationSettings<createProductPropertiesParams, typeof createProductProperty>) {
  return useMutation({
    mutationFn: (params: createProductPropertiesParams) => createProductProperty(params),
    ...settings?.options,
  })
}
