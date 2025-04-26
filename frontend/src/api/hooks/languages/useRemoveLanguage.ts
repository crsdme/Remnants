import type { removeLanguageParams } from '@/api/requests'

import { removeLanguage } from '@/api/requests'
import { useMutation } from '@tanstack/react-query'

export function useRemoveLanguage(settings?: MutationSettings<removeLanguageParams, typeof removeLanguage>) {
  return useMutation({
    mutationFn: (params: removeLanguageParams) => removeLanguage(params),
    ...settings?.options,
  })
}
