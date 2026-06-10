import type { CreateLanguageRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { createLanguage } from '@/api/requests'

export function useLanguageCreate(settings?: MutationSettings<CreateLanguageRequest>) {
  return useMutation({
    mutationFn: createLanguage,
    ...settings?.options,
  })
}
