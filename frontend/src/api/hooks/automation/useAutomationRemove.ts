import type { removeAutomationsParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { removeAutomation } from '@/api/requests'

export function useAutomationRemove(settings?: MutationSettings<removeAutomationsParams, typeof removeAutomation>) {
  return useMutation({
    mutationFn: removeAutomation,
    ...settings?.options,
  })
}
