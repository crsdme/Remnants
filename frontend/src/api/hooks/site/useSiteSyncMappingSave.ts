import type { SaveSiteSyncMappingRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { saveSiteSyncMapping } from '@/api/requests'

export function useSiteSyncMappingSave(settings?: MutationSettings<SaveSiteSyncMappingRequest>) {
  return useMutation({
    mutationFn: saveSiteSyncMapping,
    ...settings?.options,
  })
}
