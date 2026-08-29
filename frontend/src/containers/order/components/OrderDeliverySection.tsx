import type { UseFormReturn } from 'react-hook-form'
import { Truck } from 'lucide-react'
import { useEffect } from 'react'
import { useWatch } from 'react-hook-form'
import { useClientQuery, useDeliveryServiceQuery } from '@/api/hooks'
import { Separator } from '@/components/ui'
import { useLocale } from '@/utils/hooks'
import { NovaPoshtaOrderDeliveryFields } from './NovaPoshtaOrderDeliveryFields'
import { emptyOrderDeliveryFormValues, toE164Phone } from './orderDeliveryForm'

interface OrderDeliverySectionProps {
  form: UseFormReturn<any>
  disabled?: boolean
}

function clientFullName(client: { name?: string, middleName?: string, lastName?: string }) {
  return [client.name, client.middleName, client.lastName].filter(Boolean).join(' ')
}

export function OrderDeliverySection({ form, disabled }: OrderDeliverySectionProps) {
  const { t } = useLocale()

  const deliveryServiceId = useWatch({ control: form.control, name: 'deliveryService' }) as string | undefined
  const clientId = useWatch({ control: form.control, name: 'client' }) as string | undefined

  const { deliveryServices } = useDeliveryServiceQuery({ pagination: { full: true } })
  const selectedService = deliveryServices.find(service => service.id === deliveryServiceId)
  const selectedServiceType = selectedService?.type

  const { clients } = useClientQuery(
    { filters: { ids: clientId ? [clientId] : [] }, pagination: { full: true } },
    { options: { enabled: Boolean(clientId) } },
  )
  const selectedClient = clients[0]

  useEffect(() => {
    if (!selectedServiceType)
      return

    const previousType = form.getValues('delivery.carrierType') as string | undefined
    form.setValue('delivery.carrierType', selectedServiceType)

    if (previousType && previousType !== selectedServiceType) {
      const cleared = emptyOrderDeliveryFormValues()
      form.setValue('delivery.method', selectedServiceType === 'selfpickup' ? 'pickup' : 'office')
      form.setValue('delivery.cityId', '')
      form.setValue('delivery.cityName', '')
      form.setValue('delivery.pointId', '')
      form.setValue('delivery.pointName', '')
      form.setValue('delivery.seats', cleared.seats)
      form.setValue('delivery.declaredValue', cleared.declaredValue)
      form.setValue('delivery.weightKg', cleared.weightKg)
      form.setValue('delivery.description', '')
      form.setValue('delivery.payer', cleared.payer)
      form.setValue('delivery.trackingNumber', '')
      return
    }

    if (selectedServiceType === 'selfpickup' && form.getValues('delivery.method') !== 'pickup')
      form.setValue('delivery.method', 'pickup')
    if (selectedServiceType === 'novaposhta' && form.getValues('delivery.method') === 'pickup')
      form.setValue('delivery.method', 'office')
  }, [form, selectedServiceType])

  useEffect(() => {
    if (disabled || !selectedClient)
      return

    if (!form.getValues('delivery.recipientName'))
      form.setValue('delivery.recipientName', clientFullName(selectedClient))

    const phone = selectedClient.phones?.find(Boolean)
    if (phone && !form.getValues('delivery.recipientPhone'))
      form.setValue('delivery.recipientPhone', toE164Phone(phone))
  }, [disabled, form, selectedClient?.id, selectedClient?.name, selectedClient?.middleName, selectedClient?.lastName, selectedClient?.phones])

  if (selectedServiceType !== 'novaposhta')
    return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Truck className="size-5 shrink-0" />
        <p className="text-lg font-bold">{t('page.order.delivery.title')}</p>
        <Separator className="flex-1" />
      </div>

      <NovaPoshtaOrderDeliveryFields
        form={form}
        deliveryServiceId={deliveryServiceId}
        disabled={disabled}
      />
    </div>
  )
}
