import type { DeliveryStatusGroup } from '@remnant/shared'

const NP_STATUS_GROUP_BY_CODE: Record<string, DeliveryStatusGroup> = {
  1: 'awaiting_shipment',
  12: 'awaiting_shipment',
  4: 'in_transit',
  5: 'in_transit',
  6: 'in_transit',
  41: 'in_transit',
  101: 'in_transit',
  104: 'in_transit',
  7: 'at_office',
  8: 'at_office',
  9: 'completed',
  10: 'money',
  11: 'money',
  102: 'returned',
  103: 'returned',
  105: 'returned',
  106: 'returned',
  108: 'returned',
}

export function mapNovaPoshtaStatusCode(statusCode: string | number | undefined): DeliveryStatusGroup {
  const code = String(statusCode ?? '').trim()
  return NP_STATUS_GROUP_BY_CODE[code] ?? 'in_transit'
}
