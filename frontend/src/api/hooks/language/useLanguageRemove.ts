import type { RemoveLanguageRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { removeLanguage } from '@/api/requests'

export function useLanguageRemove(settings?: MutationSettings<RemoveLanguageRequest>) {
  return useMutation({
    mutationFn: removeLanguage,
    ...settings?.options,
  })
}
