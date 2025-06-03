import type { removeLanguageParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { removeLanguage } from '@/api/requests'

export function useRemoveLanguages(settings?: MutationSettings<removeLanguageParams, typeof removeLanguage>) {
  return useMutation({
    mutationFn: (params: removeLanguageParams) => removeLanguage(params),
    ...settings?.options,
  })
}
