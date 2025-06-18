import type { duplicateLanguageParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { duplicateLanguage } from '@/api/requests'

export function useLanguageDuplicate(settings?: MutationSettings<duplicateLanguageParams, typeof duplicateLanguage>) {
  return useMutation({
    mutationFn: duplicateLanguage,
    ...settings?.options,
  })
}
