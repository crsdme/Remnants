import type { getBarcodesParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { getBarcodes } from '@/api/requests'

export function useMutateBarcodes(settings?: MutationSettings<getBarcodesParams, typeof getBarcodes>) {
  return useMutation({
    mutationFn: (params: getBarcodesParams) => getBarcodes(params),
    ...settings?.options,
  })
}
