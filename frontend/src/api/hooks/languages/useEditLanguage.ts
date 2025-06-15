import type { editLanguageParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { editLanguage } from '@/api/requests'

export function useEditLanguage(settings?: MutationSettings<editLanguageParams, typeof editLanguage>) {
  return useMutation({
    mutationFn: (params: editLanguageParams) => editLanguage(params),
    ...settings?.options,
  })
}
