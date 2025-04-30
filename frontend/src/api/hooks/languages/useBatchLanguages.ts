import type { batchLanguageParams } from '@/api/requests'

import { batchLanguage } from '@/api/requests'
import { useMutation } from '@tanstack/react-query'

export function useBatchLanguages(settings?: MutationSettings<batchLanguageParams, typeof batchLanguage>) {
  return useMutation({
    mutationFn: (params: batchLanguageParams) => batchLanguage(params),
    ...settings?.options,
  })
}
