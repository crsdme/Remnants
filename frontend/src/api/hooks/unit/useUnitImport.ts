import type { importUnitsParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { importUnits } from '@/api/requests'

export function useUnitImport(settings?: MutationSettings<importUnitsParams, typeof importUnits>) {
  return useMutation({
    mutationFn: importUnits,
    ...settings?.options,
  })
}
