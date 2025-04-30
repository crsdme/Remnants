import type { importLanguagesParams } from '@/api/requests'

import { importLanguages } from '@/api/requests'
import { useMutation } from '@tanstack/react-query'

export function useImportLanguages(settings?: MutationSettings<importLanguagesParams, typeof importLanguages>) {
  return useMutation({
    mutationFn: (params: importLanguagesParams) => importLanguages(params),
    ...settings?.options,
  })
}
