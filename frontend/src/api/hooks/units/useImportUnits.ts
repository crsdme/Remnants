import type { importUnitsParams } from '@/api/requests'

import { importUnits } from '@/api/requests'
import { useMutation } from '@tanstack/react-query'

export function useImportUnits(settings?: MutationSettings<importUnitsParams, typeof importUnits>) {
  return useMutation({
    mutationFn: (params: importUnitsParams) => importUnits(params),
    ...settings?.options,
  })
}
