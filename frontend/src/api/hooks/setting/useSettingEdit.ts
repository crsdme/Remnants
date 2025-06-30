import type { editSettingParams } from '@/api/types'

import { useMutation } from '@tanstack/react-query'
import { editSetting } from '@/api/requests'

export function useSettingEdit(settings?: MutationSettings<editSettingParams, typeof editSetting>) {
  return useMutation({
    mutationFn: editSetting,
    ...settings?.options,
  })
}
