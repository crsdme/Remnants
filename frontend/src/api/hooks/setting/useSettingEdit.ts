import type { EditSettingRequest } from '@remnant/shared'

import { useMutation } from '@tanstack/react-query'
import { editSetting } from '@/api/requests'

export function useSettingEdit(settings?: MutationSettings<EditSettingRequest>) {
  return useMutation({
    mutationFn: editSetting,
    ...settings?.options,
  })
}
