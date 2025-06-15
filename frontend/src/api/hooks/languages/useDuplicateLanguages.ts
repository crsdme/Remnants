import type { duplicateLanguageParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { duplicateLanguage } from '@/api/requests'

export function useDuplicateLanguages(settings?: MutationSettings<duplicateLanguageParams, typeof duplicateLanguage>) {
  return useMutation({
    mutationFn: (params: duplicateLanguageParams) => duplicateLanguage(params),
    ...settings?.options,
  })
}
