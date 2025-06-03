import type { createLanguagesParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { createLanguage } from '@/api/requests'

export function useCreateLanguage(settings?: MutationSettings<createLanguagesParams, typeof createLanguage>) {
  return useMutation({
    mutationFn: (params: createLanguagesParams) => createLanguage(params),
    ...settings?.options,
  })
}
