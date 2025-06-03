import type { importUnitsParams } from '@/api/requests'

import { useMutation } from '@tanstack/react-query'
import { importUnits } from '@/api/requests'

export function useImportUnits(settings?: MutationSettings<importUnitsParams, typeof importUnits>) {
  return useMutation({
    mutationFn: (params: importUnitsParams) => importUnits(params),
    ...settings?.options,
  })
}
