import type { AdapterContext, LookupShipmentResult } from '../types'
import { HttpError } from '@/utils'
import { toMinor } from '@/utils/money'
import { novaPoshtaRequest, novaPoshtaRequestRaw, requireNovaPoshtaApiKey } from './client'
import { senderPhoneFromCredentials } from './phone'

interface NpTrackingDocument {
  Number?: string
  Ref?: string
  Status?: string
  StatusCode?: string | number
  DateCreated?: string
  RecipientFullName?: string
  RecipientFullNameEW?: string
  RecipientName?: string
  PhoneRecipient?: string
  PhoneSender?: string
  CityRecipient?: string
  CityRecipientRef?: string
  WarehouseRecipient?: string
  WarehouseRecipientInternetAddressRef?: string
  RecipientAddressRef?: string
  CategoryOfWarehouse?: string
  DocumentWeight?: string | number
  SeatsAmount?: string | number
  AnnouncedPrice?: string | number
  DocumentCost?: string | number
  PayerType?: string
  CargoDescription?: string
  CargoDescriptionString?: string
  CounterpartyRecipientDescription?: string
}

interface NpInternetDocument {
  IntDocNumber?: string
  Ref?: string
  RecipientsPhone?: string
  RecipientPhone?: string
  RecipientContactName?: string
  RecipientContactPerson?: string
  CityRecipient?: string
  CityRecipientDescription?: string
  CityRecipientRef?: string
  RecipientAddressDescription?: string
  RecipientAddressName?: string
  RecipientAddress?: string
  RecipientAddressRef?: string
  SeatsAmount?: string | number
  DocumentWeight?: string | number
  Weight?: string | number
  Cost?: string | number
  AnnouncedPrice?: string | number
  PayerType?: string
  Description?: string
  DateTime?: string
  CategoryOfWarehouse?: string
}

function isNonEmpty(value: string | null | undefined): value is string {
  return value != null && value !== ''
}

function optionalTrim(value: string | null | undefined): string | undefined {
  const next = value?.trim()
  return isNonEmpty(next) ? next : undefined
}

function digits(value: string): string {
  return value.replace(/\D/g, '')
}

function parsePositiveNumber(value: string | number | undefined): number | undefined {
  if (value == null || value === '')
    return undefined
  const n = typeof value === 'number' ? value : Number(String(value).replace(',', '.'))
  if (Number.isNaN(n) || n <= 0)
    return undefined
  return n
}

function parsePositiveInt(value: string | number | undefined): number | undefined {
  const n = parsePositiveNumber(value)
  if (n == null)
    return undefined
  return Math.max(1, Math.round(n))
}

function isLockerWarehouse(category?: string, warehouseName?: string): boolean {
  const haystack = `${category ?? ''} ${warehouseName ?? ''}`.toLowerCase()
  return haystack.includes('postomat') || haystack.includes('поштомат')
}

function formatNpDay(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}.${month}.${date.getFullYear()}`
}

function parseNpDay(value?: string): string | undefined {
  const match = value?.trim().match(/^(\d{2})[.\-/](\d{2})[.\-/](\d{4})/)
  if (!match)
    return undefined
  return `${match[1]}.${match[2]}.${match[3]}`
}

function firstNonEmpty(...values: Array<string | null | undefined>): string | undefined {
  for (const value of values) {
    const next = optionalTrim(value)
    if (next)
      return next
  }
  return undefined
}

async function fetchOwnedDocument(params: {
  apiKey: string
  ttn: string
  dateCreated?: string
}): Promise<NpInternetDocument | undefined> {
  const { apiKey, ttn, dateCreated } = params
  const day = parseNpDay(dateCreated)
  const rangeEnd = new Date()
  const rangeStart = new Date()
  rangeStart.setDate(rangeStart.getDate() - 90)
  const attempts: Array<Record<string, unknown>> = [
    {
      IntDocNumber: ttn,
      DateTimeFrom: day ?? formatNpDay(rangeStart),
      DateTimeTo: day ?? formatNpDay(rangeEnd),
    },
    { IntDocNumber: ttn },
  ]

  for (const methodProperties of attempts) {
    try {
      const body = await novaPoshtaRequestRaw<NpInternetDocument[]>({
        apiKey,
        modelName: 'InternetDocument',
        calledMethod: 'getDocumentList',
        methodProperties,
      })
      if (body?.success !== true)
        continue
      const found = (body.data ?? []).find(item => item.IntDocNumber?.trim() === ttn)
      if (found)
        return found
    }
    catch {
      // try the next filter
    }
  }

  return undefined
}

function isOwnedBySenderPhone(phoneSender?: string, accountPhone?: string): boolean {
  if (!isNonEmpty(phoneSender) || !isNonEmpty(accountPhone))
    return false
  return digits(phoneSender) === digits(accountPhone)
}

export async function lookupNovaPoshtaShipment(
  ctx: AdapterContext,
  trackingNumber: string,
): Promise<LookupShipmentResult> {
  const apiKey = requireNovaPoshtaApiKey(ctx)
  const ttn = trackingNumber.trim()
  if (ttn === '') {
    throw new HttpError(400, 'Tracking number is required', 'SHIPMENT_NOT_CREATED')
  }

  const accountPhone = senderPhoneFromCredentials(ctx.credentials)

  const documents = await novaPoshtaRequest<NpTrackingDocument[]>({
    apiKey,
    modelName: 'TrackingDocument',
    calledMethod: 'getStatusDocuments',
    methodProperties: {
      Documents: [{ DocumentNumber: ttn, Phone: accountPhone ?? '' }],
    },
  })

  const document = (documents ?? []).find(item => item.Number?.trim() === ttn) ?? documents?.[0]
  const foundNumber = document?.Number?.trim()
  const statusText = document?.Status?.toLowerCase() ?? ''
  if (!isNonEmpty(foundNumber) || statusText.includes('не найден') || statusText.includes('not found')) {
    throw new HttpError(404, 'Waybill was not found', 'SHIPMENT_NOT_FOUND')
  }

  const ownedDocument = await fetchOwnedDocument({
    apiKey,
    ttn: foundNumber,
    dateCreated: document.DateCreated,
  })
  const ownedByAccount = ownedDocument != null || isOwnedBySenderPhone(document.PhoneSender, accountPhone)
  const documentRef = firstNonEmpty(ownedDocument?.Ref, document.Ref)

  const announced = parsePositiveNumber(ownedDocument?.AnnouncedPrice)
    ?? parsePositiveNumber(ownedDocument?.Cost)
    ?? parsePositiveNumber(document.AnnouncedPrice)
    ?? parsePositiveNumber(document.DocumentCost)
  const weightKg = parsePositiveNumber(ownedDocument?.DocumentWeight)
    ?? parsePositiveNumber(ownedDocument?.Weight)
    ?? parsePositiveNumber(document.DocumentWeight)
  const seats = parsePositiveInt(ownedDocument?.SeatsAmount) ?? parsePositiveInt(document.SeatsAmount)
  const payerRaw = firstNonEmpty(ownedDocument?.PayerType, document.PayerType)?.toLowerCase()
  const cityRef = firstNonEmpty(ownedDocument?.CityRecipientRef, document.CityRecipientRef)
  const pointRef = firstNonEmpty(
    ownedDocument?.RecipientAddressRef,
    document.WarehouseRecipientInternetAddressRef,
    document.RecipientAddressRef,
  )
  const cityName = firstNonEmpty(
    ownedDocument?.CityRecipientDescription,
    ownedDocument?.CityRecipient,
    document.CityRecipient,
  )
  const pointName = firstNonEmpty(
    ownedDocument?.RecipientAddressDescription,
    ownedDocument?.RecipientAddressName,
    ownedDocument?.RecipientAddress,
    document.WarehouseRecipient,
  )
  const recipientName = firstNonEmpty(
    ownedDocument?.RecipientContactName,
    ownedDocument?.RecipientContactPerson,
    document.RecipientFullName,
    document.RecipientFullNameEW,
    document.RecipientName,
    document.CounterpartyRecipientDescription,
  )
  const recipientPhone = firstNonEmpty(
    ownedDocument?.RecipientsPhone,
    ownedDocument?.RecipientPhone,
    document.PhoneRecipient,
  )
  const description = firstNonEmpty(
    ownedDocument?.Description,
    document.CargoDescriptionString,
    document.CargoDescription,
  )

  return {
    trackingNumber: foundNumber,
    ownedByAccount,
    ...(isNonEmpty(documentRef) ? { documentRef } : {}),
    ...(isNonEmpty(recipientName) ? { recipientName } : {}),
    ...(isNonEmpty(recipientPhone) ? { recipientPhone } : {}),
    ...(isNonEmpty(cityName) ? { cityName } : {}),
    ...(isNonEmpty(cityRef) ? { cityRef } : {}),
    ...(isNonEmpty(pointName) ? { pointName } : {}),
    ...(isNonEmpty(pointRef) ? { pointRef } : {}),
    isLocker: isLockerWarehouse(
      firstNonEmpty(ownedDocument?.CategoryOfWarehouse, document.CategoryOfWarehouse),
      pointName,
    ),
    ...(seats != null ? { seats } : {}),
    ...(announced != null ? { declaredValueMinor: toMinor(announced, 2) } : {}),
    ...(weightKg != null ? { weightKg } : {}),
    ...(isNonEmpty(description) ? { description } : {}),
    ...(payerRaw === 'recipient' || payerRaw === 'sender' ? { payer: payerRaw } : {}),
  }
}
