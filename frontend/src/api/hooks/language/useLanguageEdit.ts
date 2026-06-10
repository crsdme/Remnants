import type { EditLanguageRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { editLanguage } from '@/api/requests'

export function useLanguageEdit(settings?: MutationSettings<EditLanguageRequest>) {
  return useMutation({
    mutationFn: editLanguage,
    ...settings?.options,
  })
}
