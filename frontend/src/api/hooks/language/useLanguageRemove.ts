import type { removeLanguageParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { removeLanguage } from '@/api/requests'

export function useLanguageRemove(settings?: MutationSettings<removeLanguageParams, typeof removeLanguage>) {
  return useMutation({
    mutationFn: removeLanguage,
    ...settings?.options,
  })
}
