import type { AdapterContext, TrackShipmentInput, TrackShipmentResult } from '../types'
import { novaPoshtaRequest, requireNovaPoshtaApiKey } from './client'
import { senderPhoneFromCredentials, toNpPhone } from './phone'
import { mapNovaPoshtaStatusCode } from './status-map'

interface NovaPoshtaTrackingDocument {
  Number?: string
  StatusCode?: string | number
  Status?: string
}

const TRACKING_BATCH_SIZE = 100

function chunk<T>(items: T[], size: number): T[][] {
  const batches: T[][] = []
  for (let i = 0; i < items.length; i += size)
    batches.push(items.slice(i, i + size))
  return batches
}

export async function trackNovaPoshtaShipments(
  ctx: AdapterContext,
  inputs: TrackShipmentInput[],
): Promise<TrackShipmentResult[]> {
  const apiKey = requireNovaPoshtaApiKey(ctx)
  const senderPhone = senderPhoneFromCredentials(ctx.credentials) ?? ''
  const results: TrackShipmentResult[] = []

  for (const batch of chunk(inputs, TRACKING_BATCH_SIZE)) {
    const documents = await novaPoshtaRequest<NovaPoshtaTrackingDocument[]>({
      apiKey,
      modelName: 'TrackingDocument',
      calledMethod: 'getStatusDocuments',
      methodProperties: {
        Documents: batch.map(item => ({
          DocumentNumber: item.trackingNumber,
          Phone: item.phone != null && item.phone !== '' ? toNpPhone(item.phone) : senderPhone,
        })),
      },
    })

    for (const document of documents ?? []) {
      const trackingNumber = document.Number?.trim()
      if (trackingNumber == null || trackingNumber === '')
        continue

      const carrierStatusCode = String(document.StatusCode ?? '').trim()
      results.push({
        trackingNumber,
        carrierStatusCode,
        carrierStatusText: document.Status?.trim() ?? '',
        group: mapNovaPoshtaStatusCode(carrierStatusCode),
      })
    }
  }

  return results
}
