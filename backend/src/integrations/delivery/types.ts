import type {
  DeliveryCapabilitiesDTO,
  DeliveryCarrierType,
  DeliveryLocationDTO,
  DeliveryLocationKind,
  DeliveryServiceCredentials,
  DeliveryStatusGroup,
  OrderDeliveryDTO,
} from '@remnant/shared'

export interface AdapterContext {
  apiKey?: string
  credentials?: DeliveryServiceCredentials
}

export interface LocationQuery {
  kind: DeliveryLocationKind
  query?: string
  parentId?: string
}

export interface CreateShipmentInput {
  delivery: OrderDeliveryDTO
  orderSeq?: number
}

export interface CreateShipmentResult {
  trackingNumber: string
  providerRefs?: Record<string, string>
  createdAt: Date
}

export interface TrackShipmentInput {
  trackingNumber: string
  phone?: string
}

export interface TrackShipmentResult {
  trackingNumber: string
  carrierStatusCode: string
  carrierStatusText: string
  group: DeliveryStatusGroup
}

export interface LookupShipmentResult {
  trackingNumber: string
  ownedByAccount: boolean
  documentRef?: string
  recipientName?: string
  recipientPhone?: string
  cityName?: string
  cityRef?: string
  pointName?: string
  pointRef?: string
  isLocker?: boolean
  seats?: number
  declaredValueMinor?: number
  weightKg?: number
  description?: string
  payer?: 'sender' | 'recipient'
}

export interface DeliveryCarrierAdapter {
  readonly type: DeliveryCarrierType
  capabilities: () => DeliveryCapabilitiesDTO
  searchLocations: (__ctx: AdapterContext, __query: LocationQuery) => Promise<DeliveryLocationDTO[]>
  createShipment?: (__ctx: AdapterContext, __input: CreateShipmentInput) => Promise<CreateShipmentResult>
  getLabel?: (__ctx: AdapterContext, __trackingNumber: string) => Promise<Uint8Array>
  trackShipments?: (__ctx: AdapterContext, __inputs: TrackShipmentInput[]) => Promise<TrackShipmentResult[]>
  lookupShipment?: (__ctx: AdapterContext, __trackingNumber: string) => Promise<LookupShipmentResult>
}
