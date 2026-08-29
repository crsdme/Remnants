import type { CreateOrderShipmentRequest, OrderDeliveryDTO, OrderDeliveryInput } from '@remnant/shared'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { useOrderShipmentCreate } from '@/api/hooks'
import { printOrderShipmentLabel } from '@/api/requests'
import { useLocale } from '@/utils/hooks'

function isNonEmpty(value: string | null | undefined): value is string {
  return value != null && value !== ''
}

interface ApiErrorShape {
  code?: string
  message?: string
  description?: string
}

async function apiErrorFromUnknown(error: unknown): Promise<{ code: string, message: string, description: string }> {
  const data = (error as { response?: { data?: unknown } }).response?.data
  let parsed: { error?: ApiErrorShape } | undefined

  if (data instanceof Blob) {
    try {
      parsed = JSON.parse(await data.text()) as { error?: ApiErrorShape }
    }
    catch {
      parsed = undefined
    }
  }
  else if (data != null && typeof data === 'object') {
    parsed = data as { error?: ApiErrorShape }
  }

  return {
    code: parsed?.error?.code ?? 'undefined',
    message: parsed?.error?.message ?? '',
    description: parsed?.error?.description ?? '',
  }
}

function openPdfBlob(blob: Blob, printWindow: Window | null) {
  const objectUrl = URL.createObjectURL(blob)
  if (printWindow != null)
    printWindow.location.href = objectUrl
  else
    window.open(objectUrl, '_blank', 'noopener,noreferrer')
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
}

export function usePrintOrderTtn() {
  const { t } = useLocale()
  const createShipment = useOrderShipmentCreate()
  const [isPrinting, setIsPrinting] = useState(false)

  const printTtn = useCallback(async (params: {
    orderId: string
    trackingNumber?: string
    delivery?: OrderDeliveryInput
    onCreated?: (delivery: OrderDeliveryDTO) => void
  }) => {
    const { orderId, trackingNumber, delivery, onCreated } = params
    const printWindow = window.open('about:blank', '_blank')
    setIsPrinting(true)

    try {
      if (!isNonEmpty(trackingNumber?.trim())) {
        const payload: CreateOrderShipmentRequest = { id: orderId }
        if (delivery != null)
          payload.delivery = delivery

        const { data } = await createShipment.mutateAsync(payload)
        onCreated?.(data.data)
        toast.success(t(`response.title.${data.code}`), {
          description: `${t(`response.description.${data.code}`)} ${data.message || ''}`,
        })
      }

      const { data: blob } = await printOrderShipmentLabel({ id: orderId })
      openPdfBlob(blob, printWindow)
    }
    catch (error) {
      printWindow?.close()
      const apiError = await apiErrorFromUnknown(error)
      const details = apiError.description || apiError.message
      toast.error(t(`error.title.${apiError.code}`), {
        description: `${t(`error.description.${apiError.code}`)} ${details}`.trim(),
      })
    }
    finally {
      setIsPrinting(false)
    }
  }, [createShipment, t])

  return {
    printTtn,
    isPending: createShipment.isPending || isPrinting,
  }
}
