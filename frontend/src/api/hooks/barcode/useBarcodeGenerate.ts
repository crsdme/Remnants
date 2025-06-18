import { useMutation } from '@tanstack/react-query'
import { generateCode } from '@/api/requests'

export function useBarcodeGenerate(settings?: MutationSettings) {
  return useMutation({
    mutationFn: generateCode,
    ...settings?.options,
  })
}
