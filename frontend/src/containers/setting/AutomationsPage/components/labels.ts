import { useMemo } from 'react'

import {
  useDeliveryServiceQuery,
  useOrderSourceQuery,
  useOrderStatusQuery,
} from '@/api/hooks'
import { useLocale } from '@/utils/hooks'

function namesMap(items: Array<{ id: string, names: Record<string, string | undefined> }>, language: string) {
  const map = new Map<string, string>()
  for (const item of items)
    map.set(item.id, item.names[language] || item.names.en || item.id)
  return map
}

export function useAutomationLabelMaps() {
  const { language } = useLocale()
  const full = { pagination: { full: true as const } }

  const { orderStatuses } = useOrderStatusQuery(full)
  const { orderSources } = useOrderSourceQuery(full)
  const { deliveryServices } = useDeliveryServiceQuery(full)

  return useMemo(() => ({
    orderStatus: namesMap(orderStatuses, language),
    orderSource: namesMap(orderSources, language),
    deliveryService: namesMap(deliveryServices, language),
  }), [orderStatuses, orderSources, deliveryServices, language])
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
  return param
}
