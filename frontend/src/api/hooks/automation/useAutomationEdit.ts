import type { editAutomationParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { editAutomation } from '@/api/requests'

export function useAutomationEdit(settings?: MutationSettings<editAutomationParams, typeof editAutomation>) {
  return useMutation({
    mutationFn: editAutomation,
    ...settings?.options,
  })
}
