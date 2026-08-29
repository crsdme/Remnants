import type { DeliveryCarrierType, OrderDeliveryDTO, OrderDeliveryInput } from '@remnant/shared'
import { parsePhoneNumber } from 'react-phone-number-input'
import { z } from 'zod'
import { fromMinor, toMinor } from '@/utils/helpers'

export interface OrderDeliveryFormValues {
  carrierType?: DeliveryCarrierType
  recipientName: string
  recipientPhone: string
  cityId: string
  cityName: string
  pointId: string
  pointName: string
  method: 'office' | 'parcel_locker' | 'pickup'
  seats: number
  declaredValue: number
  weightKg?: number
  description: string
  payer: 'sender' | 'recipient'
  trackingNumber: string
  providerRefs?: Record<string, string>
}

export function emptyOrderDeliveryFormValues(): OrderDeliveryFormValues {
  return {
    carrierType: undefined,
    recipientName: '',
    recipientPhone: '',
    cityId: '',
    cityName: '',
    pointId: '',
    pointName: '',
    method: 'office',
    seats: 1,
    declaredValue: 0,
    weightKg: undefined,
    description: '',
    payer: 'sender',
    trackingNumber: '',
    providerRefs: undefined,
  }
}

export function orderDeliveryFormSchema(t: (key: string) => string) {
  return z.object({
    carrierType: z.enum(['novaposhta', 'selfpickup']).optional(),
    recipientName: z.string().optional().default(''),
    recipientPhone: z.string().optional().default(''),
    cityId: z.string().optional().default(''),
    cityName: z.string().optional().default(''),
    pointId: z.string().optional().default(''),
    pointName: z.string().optional().default(''),
    method: z.enum(['office', 'parcel_locker', 'pickup']).default('office'),
    seats: z.number().int().min(1).default(1),
    declaredValue: z.number().min(0).default(0),
    weightKg: z.number().min(0).optional(),
    description: z.string().optional().default(''),
    payer: z.enum(['sender', 'recipient']).default('sender'),
    trackingNumber: z.string().optional().default(''),
    providerRefs: z.record(z.string()).optional(),
  }).superRefine((data, ctx) => {
    if (!data.recipientPhone?.trim())
      return
    const withPlus = data.recipientPhone.startsWith('+')
      ? data.recipientPhone
      : `+${data.recipientPhone.replace(/\D/g, '')}`
    if (!parsePhoneNumber(withPlus)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('form.errors.invalid_phone'),
        path: ['recipientPhone'],
      })
    }
  })
}

export function toE164Phone(phone: string): string {
  const raw = phone.trim()
  if (!raw)
    return ''

  let digits = raw.replace(/\D/g, '')
  if (digits.startsWith('0'))
    digits = `38${digits}`
  if (digits.length === 9)
    digits = `380${digits}`

  const withPlus = `+${digits}`
  const parsed = parsePhoneNumber(withPlus)
  return parsed?.number ?? withPlus
}

export function orderDeliveryToFormValues(
  delivery?: OrderDeliveryDTO,
  carrierType?: DeliveryCarrierType,
): OrderDeliveryFormValues {
  const empty = emptyOrderDeliveryFormValues()
  if (!delivery) {
    return {
      ...empty,
      carrierType,
      method: carrierType === 'selfpickup' ? 'pickup' : 'office',
    }
  }

  return {
    ...empty,
    carrierType,
    recipientName: delivery.recipient?.name ?? '',
    recipientPhone: toE164Phone(delivery.recipient?.phone ?? ''),
    cityId: delivery.destination?.city?.id ?? '',
    cityName: delivery.destination?.city?.name ?? '',
    pointId: delivery.destination?.point?.id ?? '',
    pointName: delivery.destination?.point?.name ?? '',
    method: carrierType === 'selfpickup'
      ? 'pickup'
      : (delivery.method === 'parcel_locker' ? 'parcel_locker' : 'office'),
    seats: delivery.parcel?.seats ?? 1,
    declaredValue: Number(fromMinor(delivery.parcel?.declaredValueMinor ?? 0)),
    weightKg: delivery.parcel?.weightKg,
    description: delivery.parcel?.description ?? '',
    payer: delivery.parcel?.payer ?? 'sender',
    trackingNumber: delivery.shipment?.trackingNumber ?? '',
    providerRefs: delivery.shipment?.providerRefs,
  }
}

export function formValuesToOrderDelivery(
  values?: OrderDeliveryFormValues,
): OrderDeliveryInput {
  const serviceType = values?.carrierType
  if (!values || serviceType === 'selfpickup' || values.method === 'pickup') {
    return { method: 'pickup' }
  }

  const method = values.method === 'parcel_locker' ? 'parcel_locker' : 'office'
  const delivery: OrderDeliveryInput = { method }

  const name = values.recipientName.trim()
  const phone = values.recipientPhone.replace(/\D/g, '')
  if (name && phone.length >= 7)
    delivery.recipient = { name, phone }

  if (values.cityId && values.pointId) {
    delivery.destination = {
      kind: method,
      city: { id: values.cityId, name: values.cityName || values.cityId },
      point: { id: values.pointId, name: values.pointName || values.pointId },
    }
    delivery.snapshotLabel = [values.cityName, values.pointName].filter(Boolean).join(' · ')
  }

  delivery.parcel = {
    seats: values.seats || 1,
    declaredValueMinor: toMinor(values.declaredValue || 0),
    payer: values.payer || 'sender',
    description: values.description?.trim() || '',
    ...(values.weightKg != null && values.weightKg > 0 ? { weightKg: values.weightKg } : {}),
  }

  const tracking = values.trackingNumber.trim()
  if (tracking) {
    delivery.shipment = {
      trackingNumber: tracking,
      ...(values.providerRefs ? { providerRefs: values.providerRefs } : {}),
    }
  }

  return delivery
}
