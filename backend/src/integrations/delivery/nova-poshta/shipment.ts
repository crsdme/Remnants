import type { NovaPoshtaCredentials, OrderDeliveryDTO } from '@remnant/shared'
import type { AdapterContext, CreateShipmentInput, CreateShipmentResult } from '../types'
import { Buffer } from 'node:buffer'
import { toMinorType } from '@remnant/shared'
import axios from 'axios'
import { HttpError } from '@/utils'
import { fromMinor } from '@/utils/money'
import { novaPoshtaRequest, requireNovaPoshtaApiKey } from './client'
import { toNpPhone } from './phone'

interface NpRefItem {
  Ref?: string
  ContactPerson?: { data?: Array<{ Ref?: string }> }
}

interface NpInternetDocument {
  IntDocNumber?: string
  Ref?: string
  CostOnSite?: string | number
}

function isNonEmpty(value: string | null | undefined): value is string {
  return value != null && value !== ''
}

function requireNovaPoshtaCredentials(ctx: AdapterContext): NovaPoshtaCredentials {
  if (ctx.credentials?.type !== 'novaposhta') {
    throw new HttpError(400, 'Nova Poshta credentials are required', 'NOVA_POSHTA_API_KEY_REQUIRED')
  }
  return ctx.credentials
}

function splitPersonName(name: string): { FirstName: string, LastName: string, MiddleName: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0)
    return { FirstName: 'Recipient', LastName: 'Recipient', MiddleName: '' }
  if (parts.length === 1)
    return { FirstName: parts[0], LastName: parts[0], MiddleName: '' }
  if (parts.length === 2)
    return { FirstName: parts[0], LastName: parts[1], MiddleName: '' }
  return {
    FirstName: parts[0],
    MiddleName: parts.slice(1, -1).join(' '),
    LastName: parts[parts.length - 1],
  }
}

function formatNpDate(date = new Date()): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}.${month}.${date.getFullYear()}`
}

function declaredCostUah(delivery: OrderDeliveryDTO): number {
  const minor = delivery.parcel?.declaredValueMinor ?? 0
  const major = Number(fromMinor(toMinorType(minor), 2))
  return Math.max(1, Math.round(major))
}

function parcelWeightKg(delivery: OrderDeliveryDTO): number {
  const weight = delivery.parcel?.weightKg
  if (weight == null || Number.isNaN(weight) || weight <= 0)
    return 0.5
  return Math.max(0.1, weight)
}

function positiveOr(value: number | undefined, fallback: number): number {
  if (value == null || Number.isNaN(value) || value <= 0)
    return fallback
  return value
}

async function getContactRef(apiKey: string, counterpartyRef: string): Promise<string | undefined> {
  const contacts = await novaPoshtaRequest<NpRefItem[]>({
    apiKey,
    modelName: 'Counterparty',
    calledMethod: 'getCounterpartyContactPersons',
    methodProperties: {
      Ref: counterpartyRef,
      Page: '1',
    },
  })
  const ref = contacts[0]?.Ref
  return isNonEmpty(ref) ? ref : undefined
}

async function getSender(apiKey: string): Promise<{ senderRef: string, contactRef: string }> {
  const counterparties = await novaPoshtaRequest<NpRefItem[]>({
    apiKey,
    modelName: 'Counterparty',
    calledMethod: 'getCounterparties',
    methodProperties: {
      CounterpartyProperty: 'Sender',
      Page: '1',
    },
  })

  const senderRef = counterparties[0]?.Ref
  if (!isNonEmpty(senderRef)) {
    throw new HttpError(400, 'Nova Poshta sender counterparty was not found', 'NOVA_POSHTA_SENDER_NOT_FOUND')
  }

  const contactRef = await getContactRef(apiKey, senderRef)
  if (!isNonEmpty(contactRef)) {
    throw new HttpError(400, 'Nova Poshta sender contact was not found', 'NOVA_POSHTA_SENDER_NOT_FOUND')
  }

  return { senderRef, contactRef }
}

async function getOrCreateRecipient(
  apiKey: string,
  name: string,
  phone: string,
): Promise<{ recipientRef: string, contactRef: string }> {
  const person = splitPersonName(name)

  try {
    const saved = await novaPoshtaRequest<NpRefItem[]>({
      apiKey,
      modelName: 'Counterparty',
      calledMethod: 'save',
      methodProperties: {
        FirstName: person.FirstName,
        LastName: person.LastName,
        MiddleName: person.MiddleName,
        Phone: phone,
        CounterpartyType: 'PrivatePerson',
        CounterpartyProperty: 'Recipient',
      },
    })

    const recipientRef = saved[0]?.Ref
    const savedContactRef = saved[0]?.ContactPerson?.data?.[0]?.Ref
    if (isNonEmpty(recipientRef)) {
      const fromSave = isNonEmpty(savedContactRef) ? savedContactRef : undefined
      const contactRef = fromSave ?? await getContactRef(apiKey, recipientRef) ?? recipientRef
      return { recipientRef, contactRef }
    }
  }
  catch {
    // Recipient may already exist — search by phone below.
  }

  const found = await novaPoshtaRequest<NpRefItem[]>({
    apiKey,
    modelName: 'Counterparty',
    calledMethod: 'getCounterparties',
    methodProperties: {
      CounterpartyProperty: 'Recipient',
      FindByString: phone,
      Page: '1',
    },
  })

  const recipientRef = found[0]?.Ref
  if (!isNonEmpty(recipientRef)) {
    throw new HttpError(400, 'Failed to create Nova Poshta recipient', 'NOVA_POSHTA_RECIPIENT_FAILED')
  }

  const contactRef = await getContactRef(apiKey, recipientRef) ?? recipientRef
  return { recipientRef, contactRef }
}

function lockerSeat(delivery: OrderDeliveryDTO, weight: number) {
  const length = positiveOr(delivery.parcel?.lengthCm, 30)
  const width = positiveOr(delivery.parcel?.widthCm, 20)
  const height = positiveOr(delivery.parcel?.heightCm, 10)
  const volume = Math.max(0.0004, (length * width * height) / 1_000_000)

  return {
    volumetricVolume: String(volume),
    volumetricWidth: String(width),
    volumetricLength: String(length),
    volumetricHeight: String(height),
    weight: String(weight),
  }
}

export async function createNovaPoshtaShipment(
  ctx: AdapterContext,
  input: CreateShipmentInput,
): Promise<CreateShipmentResult> {
  const apiKey = requireNovaPoshtaApiKey(ctx)
  const credentials = requireNovaPoshtaCredentials(ctx)
  const { delivery } = input

  const recipientName = delivery.recipient?.name?.trim()
  const rawPhone = delivery.recipient?.phone
  const recipientPhone = isNonEmpty(rawPhone) ? toNpPhone(rawPhone) : ''
  const cityRef = delivery.destination?.city?.id
  const pointRef = delivery.destination?.point?.id

  if (!isNonEmpty(recipientName) || recipientPhone.length < 10 || !isNonEmpty(cityRef) || !isNonEmpty(pointRef)) {
    throw new HttpError(400, 'Recipient and destination are required', 'DELIVERY_DETAILS_REQUIRED')
  }

  const [sender, recipient] = await Promise.all([
    getSender(apiKey),
    getOrCreateRecipient(apiKey, recipientName, recipientPhone),
  ])

  const weight = parcelWeightKg(delivery)
  const isLocker = delivery.method === 'parcel_locker' || delivery.destination?.kind === 'parcel_locker'
  const descriptionRaw = delivery.parcel?.description?.trim()
  const description = isNonEmpty(descriptionRaw) ? descriptionRaw : 'Goods'
  const seats = delivery.parcel?.seats
  const volume = delivery.parcel?.volumeM3

  const methodProperties: Record<string, unknown> = {
    PayerType: delivery.parcel?.payer === 'recipient' ? 'Recipient' : 'Sender',
    PaymentMethod: 'Cash',
    DateTime: formatNpDate(),
    CargoType: 'Parcel',
    Weight: String(weight),
    ServiceType: 'WarehouseWarehouse',
    SeatsAmount: String(seats != null && seats > 0 ? seats : 1),
    Description: description,
    Cost: String(declaredCostUah(delivery)),
    CitySender: credentials.sender.city.id,
    Sender: sender.senderRef,
    SenderAddress: credentials.sender.office.id,
    ContactSender: sender.contactRef,
    SendersPhone: toNpPhone(credentials.phone),
    CityRecipient: cityRef,
    Recipient: recipient.recipientRef,
    RecipientAddress: pointRef,
    ContactRecipient: recipient.contactRef,
    RecipientsPhone: recipientPhone,
    ...(input.orderSeq != null ? { InfoRegClientBarcodes: String(input.orderSeq) } : {}),
  }

  if (isLocker) {
    methodProperties.OptionsSeat = [lockerSeat(delivery, weight)]
  }
  else {
    methodProperties.VolumeGeneral = String(Math.max(0.0004, volume != null && volume > 0 ? volume : 0.001))
  }

  const documents = await novaPoshtaRequest<NpInternetDocument[]>({
    apiKey,
    modelName: 'InternetDocument',
    calledMethod: 'save',
    methodProperties,
    timeoutMs: 20000,
  })

  const document = documents[0]
  const trackingNumber = document?.IntDocNumber
  if (!isNonEmpty(trackingNumber)) {
    throw new HttpError(502, 'Nova Poshta did not return a tracking number', 'NOVA_POSHTA_SHIPMENT_FAILED')
  }

  const providerRefs: Record<string, string> = {}
  if (isNonEmpty(document?.Ref))
    providerRefs.documentRef = document.Ref
  if (document?.CostOnSite != null)
    providerRefs.costOnSite = String(document.CostOnSite)

  return {
    trackingNumber,
    ...(Object.keys(providerRefs).length > 0 ? { providerRefs } : {}),
    createdAt: new Date(),
  }
}

function isPdfBuffer(buffer: Buffer): boolean {
  return buffer.subarray(0, 1024).toString('latin1').includes('%PDF')
}

function extractNovaPoshtaLabelError(buffer: Buffer): string {
  if (buffer.length === 0)
    return 'Nova Poshta returned an empty response'

  if (buffer.subarray(0, 2).toString('latin1') === 'PK')
    return 'Nova Poshta returned a ZIP archive instead of a PDF'

  const text = buffer.subarray(0, 4000).toString('utf8').trim()
  try {
    const json = JSON.parse(text) as {
      errors?: unknown[]
      error?: unknown
      message?: unknown
    }
    const firstError = json.errors?.[0]
    if (typeof firstError === 'string' && firstError.trim() !== '')
      return firstError.trim()
    if (typeof json.error === 'string' && json.error.trim() !== '')
      return json.error.trim()
    if (typeof json.message === 'string' && json.message.trim() !== '')
      return json.message.trim()
  }
  catch {
    // HTML or another non-JSON body from the print URL
  }

  const title = text.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.replace(/\s+/g, ' ').trim()
  if (title != null && title !== '')
    return title

  const stripped = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (stripped !== '')
    return stripped.slice(0, 400)

  return 'Nova Poshta did not return a PDF label'
}

export async function getNovaPoshtaLabel(ctx: AdapterContext, trackingNumber: string): Promise<Buffer> {
  const apiKey = requireNovaPoshtaApiKey(ctx)
  const ttn = trackingNumber.trim()
  if (ttn === '') {
    throw new HttpError(400, 'Tracking number is required', 'SHIPMENT_NOT_CREATED')
  }

  const url = `https://my.novaposhta.ua/orders/printMarking100x100/orders[]/${encodeURIComponent(ttn)}/type/pdf/apiKey/${encodeURIComponent(apiKey)}/zebra`

  let response
  try {
    response = await axios.get<ArrayBuffer>(url, {
      responseType: 'arraybuffer',
      timeout: 20000,
      validateStatus: () => true,
    })
  }
  catch {
    throw new HttpError(502, 'Failed to download Nova Poshta label', 'NOVA_POSHTA_LABEL_FAILED')
  }

  const buffer = Buffer.from(response.data)
  if (isPdfBuffer(buffer))
    return buffer

  throw new HttpError(
    502,
    'Nova Poshta label is not a PDF',
    'NOVA_POSHTA_LABEL_FAILED',
    extractNovaPoshtaLabelError(buffer),
  )
}
