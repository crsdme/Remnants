import type { createAutomationParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { createAutomation } from '@/api/requests'

export function useAutomationCreate(settings?: MutationSettings<createAutomationParams, typeof createAutomation>) {
  return useMutation({
    mutationFn: createAutomation,
    ...settings?.options,
  })
}
