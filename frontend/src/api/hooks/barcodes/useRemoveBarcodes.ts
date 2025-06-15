import type { removeBarcodesParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { removeBarcodes } from '@/api/requests'

export function useRemoveBarcodes(settings?: MutationSettings<removeBarcodesParams, typeof removeBarcodes>) {
  return useMutation({
    mutationFn: (params: removeBarcodesParams) => removeBarcodes(params),
    ...settings?.options,
  })
}
