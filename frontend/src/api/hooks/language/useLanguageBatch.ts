import type { batchLanguageParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { batchLanguage } from '@/api/requests'

export function useLanguageBatch(settings?: MutationSettings<batchLanguageParams, typeof batchLanguage>) {
  return useMutation({
    mutationFn: batchLanguage,
    ...settings?.options,
  })
}
