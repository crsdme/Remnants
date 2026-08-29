import type { CurrencyDTO } from '@remnant/shared'
import type { ReactNode } from 'react'

import { DELIVERY_TRACKING_INTERVAL_SETTING_KEY, parseDeliveryTrackingIntervalMs } from '@remnant/shared'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  useCurrencyQuery,
  useOrderRemove,
  useOrderShipmentsSync,
  useSettingValue,
} from '@/api/hooks'

interface OrderContextType {
  isLoading: boolean
  removeOrder: (params: { ids: string[] }) => void
  currencies: CurrencyDTO[]
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export function OrderProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation()

  const queryClient = useQueryClient()

  const { currencies = [] } = useCurrencyQuery(
    { pagination: { current: 1, pageSize: 10 }, filters: {}, sorters: {} },
    { options: { placeholderData: prevData => prevData } },
  )

  const useMutateRemoveOrder = useOrderRemove({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['orders'] })
        void queryClient.invalidateQueries({ queryKey: ['order-statuses'] })
        toast.success(t(`response.title.${data.code}`), { description: `${t(`response.description.${data.code}`)} ${data.description || ''}` })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const trackingIntervalRaw = useSettingValue(DELIVERY_TRACKING_INTERVAL_SETTING_KEY)
  const trackingIntervalMs = parseDeliveryTrackingIntervalMs(trackingIntervalRaw)

  const { mutate: syncShipments } = useOrderShipmentsSync({
    options: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ['orders'] })
        void queryClient.invalidateQueries({ queryKey: ['order-statuses'] })
      },
    },
  })

  useEffect(() => {
    syncShipments({})
    const timer = window.setInterval(() => {
      syncShipments({})
    }, trackingIntervalMs)
    return () => window.clearInterval(timer)
  }, [syncShipments, trackingIntervalMs])

  const removeOrder = (params: { ids: string[] }) => {
    useMutateRemoveOrder.mutate(params)
  }

  const isLoading = useMutateRemoveOrder.isPending

  const value: OrderContextType = useMemo(
    () => ({
      isLoading,
      removeOrder,
      currencies,
    }),
    [isLoading, currencies],
  )

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useOrderContext(): OrderContextType {
  const context = useContext(OrderContext)
  if (!context) {
    throw new Error('useOrderContext - OrderContext')
  }
  return context
}
