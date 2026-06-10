import type { CreateAutomationRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { createAutomation } from '@/api/requests'

export function useAutomationCreate(settings?: MutationSettings<CreateAutomationRequest>) {
  return useMutation({
    mutationFn: createAutomation,
    ...settings?.options,
  })
}
