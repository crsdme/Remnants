import { useMemo } from 'react'

import {
  useDeliveryServiceQuery,
  useOrderSourceQuery,
  useOrderStatusQuery,
} from '@/api/hooks'
import { useLocale } from '@/utils/hooks'

const ORDER_PAYMENT_STATUSES = ['paid', 'unpaid', 'partially_paid', 'overpaid'] as const

function namesMap(items: Array<{ id: string, names: Record<string, string | undefined> }>, language: string) {
  const map = new Map<string, string>()
  for (const item of items)
    map.set(item.id, item.names[language] || item.names.en || item.id)
  return map
}

export function useAutomationLabelMaps() {
  const { language, t } = useLocale()
  const full = { pagination: { full: true as const } }

  const { orderStatuses } = useOrderStatusQuery(full)
  const { orderSources } = useOrderSourceQuery(full)
  const { deliveryServices } = useDeliveryServiceQuery(full)

  return useMemo(() => ({
    orderStatus: namesMap(orderStatuses, language),
    orderSource: namesMap(orderSources, language),
    deliveryService: namesMap(deliveryServices, language),
    orderPaymentStatus: new Map(
      ORDER_PAYMENT_STATUSES.map(status => [status, t(`order-payment.${status}`)]),
    ),
  }), [orderStatuses, orderSources, deliveryServices, language, t])
}

export function resolveParamLabel(
  maps: ReturnType<typeof useAutomationLabelMaps>,
  field: string,
  param: string,
) {
  if (field === 'orderStatus' || field === 'order-status-update')
    return maps.orderStatus.get(param) ?? param
  if (field === 'orderSource' || field === 'order-source-update')
    return maps.orderSource.get(param) ?? param
  if (field === 'deliveryService' || field === 'order-delivery-service-update')
    return maps.deliveryService.get(param) ?? param
  if (field === 'orderPaymentStatus')
    // FIX TYPES WARNING
    return maps.orderPaymentStatus.get(param as (typeof ORDER_PAYMENT_STATUSES)[number]) ?? param
  return param
}

export { ORDER_PAYMENT_STATUSES }
