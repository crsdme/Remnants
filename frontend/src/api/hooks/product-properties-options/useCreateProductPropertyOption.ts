import type { createProductPropertiesOptionParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { createProductPropertyOption } from '@/api/requests'

export function useCreateProductPropertyOption(settings?: MutationSettings<createProductPropertiesOptionParams, typeof createProductPropertyOption>) {
  return useMutation({
    mutationFn: (params: createProductPropertiesOptionParams) => createProductPropertyOption(params),
    ...settings?.options,
  })
}
