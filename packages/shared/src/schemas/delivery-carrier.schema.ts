import { z } from 'zod'
import { idSchema, responseItemSchema, responseListSchema } from './common'

export const deliveryCarrierTypeSchema = z.enum(['novaposhta', 'selfpickup'])
export type DeliveryCarrierType = z.output<typeof deliveryCarrierTypeSchema>

export const deliveryLocationKindSchema = z.enum(['city', 'office', 'parcel_locker'])
export type DeliveryLocationKind = z.output<typeof deliveryLocationKindSchema>

export const deliveryMethodSchema = z.enum(['office', 'parcel_locker', 'courier', 'pickup'])
export type DeliveryMethod = z.output<typeof deliveryMethodSchema>

export const deliveryPayerSchema = z.enum(['sender', 'recipient'])
export type DeliveryPayer = z.output<typeof deliveryPayerSchema>

export const deliveryLocationRefSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
})
export type DeliveryLocationRef = z.output<typeof deliveryLocationRefSchema>

export const deliveryLocationSchema = z.object({
  id: z.string().min(1),
  kind: deliveryLocationKindSchema,
  name: z.string().min(1),
  parentId: z.string().optional(),
})
export type DeliveryLocationDTO = z.output<typeof deliveryLocationSchema>

export const orderDeliveryRecipientSchema = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().min(7),
})

export const orderDeliveryDestinationSchema = z.object({
  kind: z.enum(['office', 'parcel_locker', 'pickup']),
  city: deliveryLocationRefSchema.optional(),
  point: deliveryLocationRefSchema.optional(),
})

export const orderDeliveryParcelSchema = z.object({
  seats: z.number().int().positive().default(1),
  declaredValueMinor: z.number().int().nonnegative().default(0),
  weightKg: z.number().nonnegative().optional(),
  volumeM3: z.number().nonnegative().optional(),
  lengthCm: z.number().nonnegative().optional(),
  widthCm: z.number().nonnegative().optional(),
  heightCm: z.number().nonnegative().optional(),
  description: z.string().trim().optional().default(''),
  payer: deliveryPayerSchema.default('sender'),
})

export const orderDeliveryShipmentSchema = z.object({
  trackingNumber: z.string().trim().optional(),
  providerRefs: z.record(z.string()).optional(),
  carrierStatusCode: z.string().optional(),
  carrierStatusText: z.string().optional(),
  lastSyncedAt: z.coerce.date().optional(),
  createdAt: z.coerce.date().optional(),
}).optional()

/** Snapshot of delivery details on an order, including optional carrier shipment. */
export const orderDeliverySchema = z.object({
  method: deliveryMethodSchema.default('office'),
  recipient: orderDeliveryRecipientSchema.optional(),
  destination: orderDeliveryDestinationSchema.optional(),
  parcel: orderDeliveryParcelSchema.optional(),
  snapshotLabel: z.string().trim().optional(),
  shipment: orderDeliveryShipmentSchema,
})
export type OrderDeliveryDTO = z.output<typeof orderDeliverySchema>
export type OrderDeliveryInput = z.input<typeof orderDeliverySchema>

/** Accepts FormData empty string / null as “no delivery”. */
export const orderDeliveryFieldSchema = z.preprocess(
  (val) => {
    if (val == null || val === '')
      return undefined
    return val
  },
  orderDeliverySchema.optional(),
)

export const deliveryCapabilitiesSchema = z.object({
  type: deliveryCarrierTypeSchema,
  methods: z.array(deliveryMethodSchema),
  locationFlow: z.array(deliveryLocationKindSchema),
  canCreateShipment: z.boolean(),
  canPrintLabel: z.boolean(),
  canTrack: z.boolean(),
  canCancel: z.boolean(),
  requiresCredentials: z.boolean(),
})
export type DeliveryCapabilitiesDTO = z.output<typeof deliveryCapabilitiesSchema>

export const getDeliveryCapabilitiesSchema = z.object({
  id: idSchema.optional(),
  type: deliveryCarrierTypeSchema.optional(),
}).refine(data => data.id || data.type, {
  message: 'id or type is required',
})
export type GetDeliveryCapabilitiesRequest = z.input<typeof getDeliveryCapabilitiesSchema>

export const getDeliveryLocationsSchema = z.object({
  id: idSchema.optional(),
  apiKey: z.string().trim().optional(),
  type: deliveryCarrierTypeSchema.optional().default('novaposhta'),
  kind: deliveryLocationKindSchema,
  query: z.string().trim().optional().default(''),
  parentId: z.string().trim().optional(),
}).refine(data => data.id || data.apiKey, {
  message: 'id or apiKey is required',
})
export type GetDeliveryLocationsRequest = z.input<typeof getDeliveryLocationsSchema>

export const getDeliveryCapabilitiesResponseSchema = responseItemSchema(deliveryCapabilitiesSchema)
export type GetDeliveryCapabilitiesResponse = z.output<typeof getDeliveryCapabilitiesResponseSchema>

export const getDeliveryLocationsResponseSchema = responseListSchema(deliveryLocationSchema)
export type GetDeliveryLocationsResponse = z.output<typeof getDeliveryLocationsResponseSchema>

export const DELIVERY_STATUS_GROUPS = [
  'awaiting_shipment',
  'in_transit',
  'at_office',
  'money',
  'completed',
  'returned',
] as const

export const deliveryStatusGroupSchema = z.enum(DELIVERY_STATUS_GROUPS)
export type DeliveryStatusGroup = z.output<typeof deliveryStatusGroupSchema>

const optionalOrderStatusIdSchema = z.preprocess(
  val => (val === '' || val == null ? undefined : val),
  idSchema.optional(),
)

export const deliveryStatusMapSchema = z.object({
  awaiting_shipment: optionalOrderStatusIdSchema,
  in_transit: optionalOrderStatusIdSchema,
  at_office: optionalOrderStatusIdSchema,
  money: optionalOrderStatusIdSchema,
  completed: optionalOrderStatusIdSchema,
  returned: optionalOrderStatusIdSchema,
})
export type DeliveryStatusMap = z.output<typeof deliveryStatusMapSchema>

export const DELIVERY_STATUS_MAP_SETTING_KEY = 'delivery.statusMap.novaposhta'
export const DELIVERY_CURRENCY_SETTING_KEY = 'delivery.currency.novaposhta'

/** Minimum allowed tracking poll interval (Nova Poshta API courtesy). */
export const DELIVERY_TRACKING_INTERVAL_MIN_MS = 5 * 60 * 1000
/** @deprecated Prefer parseDeliveryTrackingIntervalMs / settings key. */
export const DELIVERY_TRACKING_STALE_MS = DELIVERY_TRACKING_INTERVAL_MIN_MS

export const DELIVERY_TRACKING_INTERVAL_DEFAULT = '5m'
export const DELIVERY_TRACKING_INTERVAL_PRESETS = ['5m', '15m', '30m', '1h', '6h', '12h', '1d'] as const
export type DeliveryTrackingIntervalPreset = (typeof DELIVERY_TRACKING_INTERVAL_PRESETS)[number]

export const deliveryTrackingIntervalUnitSchema = z.enum(['m', 'h', 'd'])
export type DeliveryTrackingIntervalUnit = z.output<typeof deliveryTrackingIntervalUnitSchema>

/** Stored setting value: `{amount}{unit}`, e.g. `5m`, `2h`, `1d`. */
export const deliveryTrackingIntervalValueSchema = z
  .string()
  .trim()
  .regex(/^\d+[mhd]$/)

export function deliveryTrackingIntervalSettingKey(
  type: Extract<DeliveryCarrierType, 'novaposhta'> = 'novaposhta',
): string {
  return `delivery.trackingInterval.${type}`
}

export const DELIVERY_TRACKING_INTERVAL_SETTING_KEY = deliveryTrackingIntervalSettingKey('novaposhta')

export function parseDeliveryTrackingIntervalMs(raw: string | undefined | null): number {
  const match = /^(\d+)([mhd])$/.exec((raw ?? '').trim())
  if (match == null) {
    return DELIVERY_TRACKING_INTERVAL_MIN_MS
  }

  const amount = Number(match[1])
  if (!Number.isFinite(amount) || amount <= 0) {
    return DELIVERY_TRACKING_INTERVAL_MIN_MS
  }

  const unit = match[2] as DeliveryTrackingIntervalUnit
  const unitMs = unit === 'm' ? 60_000 : unit === 'h' ? 3_600_000 : 86_400_000
  return Math.max(amount * unitMs, DELIVERY_TRACKING_INTERVAL_MIN_MS)
}

export function formatDeliveryTrackingInterval(amount: number, unit: DeliveryTrackingIntervalUnit): string {
  const safeAmount = Number.isFinite(amount) && amount > 0 ? Math.trunc(amount) : 5
  return `${safeAmount}${unit}`
}

export const lookupDeliveryShipmentSchema = z.object({
  id: idSchema,
  trackingNumber: z.string().trim().min(8).max(32),
})
export type LookupDeliveryShipmentRequest = z.input<typeof lookupDeliveryShipmentSchema>

export const lookupDeliveryShipmentDataSchema = z.object({
  trackingNumber: z.string(),
  ownedByAccount: z.boolean(),
  method: z.enum(['office', 'parcel_locker']).optional(),
  recipientName: z.string().optional(),
  recipientPhone: z.string().optional(),
  city: deliveryLocationRefSchema.optional(),
  point: deliveryLocationRefSchema.optional(),
  snapshotLabel: z.string().optional(),
  seats: z.number().int().positive().optional(),
  declaredValueMinor: z.number().int().nonnegative().optional(),
  weightKg: z.number().nonnegative().optional(),
  description: z.string().optional(),
  payer: deliveryPayerSchema.optional(),
  documentRef: z.string().optional(),
})
export type LookupDeliveryShipmentData = z.output<typeof lookupDeliveryShipmentDataSchema>

export const lookupDeliveryShipmentResponseSchema = responseItemSchema(lookupDeliveryShipmentDataSchema)
export type LookupDeliveryShipmentResponse = z.output<typeof lookupDeliveryShipmentResponseSchema>
