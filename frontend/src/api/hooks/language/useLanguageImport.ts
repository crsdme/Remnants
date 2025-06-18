import type { importLanguagesParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { importLanguages } from '@/api/requests'

export function useLanguageImport(settings?: MutationSettings<importLanguagesParams, typeof importLanguages>) {
  return useMutation({
    mutationFn: importLanguages,
    ...settings?.options,
  })
}
