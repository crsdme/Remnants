import type { createLanguagesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { createLanguage } from '@/api/requests'

export function useLanguageCreate(settings?: MutationSettings<createLanguagesParams, typeof createLanguage>) {
  return useMutation({
    mutationFn: createLanguage,
    ...settings?.options,
  })
}
