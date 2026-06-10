import type { EditAutomationRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { editAutomation } from '@/api/requests'

export function useAutomationEdit(settings?: MutationSettings<EditAutomationRequest>) {
  return useMutation({
    mutationFn: editAutomation,
    ...settings?.options,
  })
}
