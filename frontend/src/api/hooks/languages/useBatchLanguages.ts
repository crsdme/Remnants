import type { batchLanguageParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { batchLanguage } from '@/api/requests'

export function useBatchLanguages(settings?: MutationSettings<batchLanguageParams, typeof batchLanguage>) {
  return useMutation({
    mutationFn: (params: batchLanguageParams) => batchLanguage(params),
    ...settings?.options,
  })
}
