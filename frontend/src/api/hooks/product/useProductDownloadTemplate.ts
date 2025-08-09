import { useMutation } from '@tanstack/react-query'
import { downloadTemplate } from '@/api/requests'

export function useProductDownloadTemplate(settings?: MutationSettings<void, typeof downloadTemplate>) {
  return useMutation({
    mutationFn: downloadTemplate,
    ...settings?.options,
  })
}
