import type { RemoveAutomationsRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { removeAutomation } from '@/api/requests'

export function useAutomationRemove(settings?: MutationSettings<RemoveAutomationsRequest>) {
  return useMutation({
    mutationFn: removeAutomation,
    ...settings?.options,
  })
}
