import type { editLanguageParams } from '@/api/requests'

import { editLanguage } from '@/api/requests'
import { useMutation } from '@tanstack/react-query'

export function useEditLanguage(settings?: MutationSettings<editLanguageParams, typeof editLanguage>) {
  return useMutation({
    mutationFn: (params: editLanguageParams) => editLanguage(params),
    ...settings?.options,
  })
}
