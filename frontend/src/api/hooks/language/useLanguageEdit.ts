import type { editLanguageParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { editLanguage } from '@/api/requests'

export function useLanguageEdit(settings?: MutationSettings<editLanguageParams, typeof editLanguage>) {
  return useMutation({
    mutationFn: editLanguage,
    ...settings?.options,
  })
}
