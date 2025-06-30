import type { ReactNode } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  useCashregisterAccountQuery,
  useSettingEdit,
  useSettingQuery,
} from '@/api/hooks'

interface SettingContextType {
  isLoading: boolean
  editSetting: (params) => void
  getSetting: (key: string) => Setting | undefined
}

const SettingContext = createContext<SettingContextType | undefined>(undefined)

interface SettingProviderProps {
  children: ReactNode
}

export function SettingProvider({ children }: SettingProviderProps) {
  const [isLoading, setIsLoading] = useState(false)

  const { t } = useTranslation()

  const queryClient = useQueryClient()

  const useMutateEditSetting = useSettingEdit({
    options: {
      onSuccess: ({ data }) => {
        setIsLoading(false)
        queryClient.invalidateQueries({ queryKey: ['settings'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        setIsLoading(false)
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const editSetting = (params) => {
    setIsLoading(true)
    return useMutateEditSetting.mutate(params)
  }

  const { data: { settings = [] } = {} } = useSettingQuery({}, { options: {
    select: response => ({
      settings: response.data.settings,
    }),
  } })

  const getSetting = (key: string) => {
    return settings.find(setting => setting.key === key)
  }

  const value: SettingContextType = useMemo(
    () => ({
      isLoading,
      editSetting,
      getSetting,
    }),
    [isLoading, settings, getSetting],
  )

  return <SettingContext.Provider value={value}>{children}</SettingContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettingContext(): SettingContextType {
  const context = useContext(SettingContext)
  if (!context) {
    throw new Error('useSettingContext - SettingContext')
  }
  return context
}
