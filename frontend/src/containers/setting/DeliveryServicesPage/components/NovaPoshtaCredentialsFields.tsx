import type { DeliveryLocationDTO } from '@remnant/shared'
import { DELIVERY_SERVICE_API_KEY_MASK } from '@remnant/shared'
import { useCallback, useMemo, useRef } from 'react'
import { useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useDeliveryLocationOptions } from '@/api/hooks/delivery-service/useDeliveryLocationOptions'
import { AsyncSelectNew } from '@/components/AsyncSelectNew'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  PhoneInput,
} from '@/components/ui'
import { useDeliveryServiceContext } from '../context'

export function NovaPoshtaCredentialsFields() {
  const { t } = useTranslation()
  const { isLoading, isEdit, selectedDeliveryService, form } = useDeliveryServiceContext()

  const apiKey = useWatch({ control: form.control, name: 'apiKey' })
  const senderCityId = useWatch({ control: form.control, name: 'senderCityId' })
  const senderCityName = useWatch({ control: form.control, name: 'senderCityName' })
  const senderOfficeId = useWatch({ control: form.control, name: 'senderOfficeId' })
  const senderOfficeName = useWatch({ control: form.control, name: 'senderOfficeName' })

  const effectiveApiKey = apiKey && apiKey !== DELIVERY_SERVICE_API_KEY_MASK ? apiKey : undefined
  const serviceId = isEdit ? selectedDeliveryService?.id : undefined
  const canSearchLocations = Boolean(serviceId || effectiveApiKey)

  const pinnedCity = useMemo<DeliveryLocationDTO | null>(() => {
    if (!senderCityId || !senderCityName)
      return null
    return { id: senderCityId, kind: 'city', name: senderCityName }
  }, [senderCityId, senderCityName])

  const pinnedOffice = useMemo<DeliveryLocationDTO | null>(() => {
    if (!senderOfficeId || !senderOfficeName)
      return null
    return { id: senderOfficeId, kind: 'office', name: senderOfficeName, parentId: senderCityId || undefined }
  }, [senderCityId, senderOfficeId, senderOfficeName])

  const lastCityOptionsRef = useRef<DeliveryLocationDTO[]>([])
  const lastOfficeOptionsRef = useRef<DeliveryLocationDTO[]>([])

  const loadCityOptionsBase = useDeliveryLocationOptions({
    id: serviceId,
    apiKey: effectiveApiKey,
    kind: 'city',
    enabled: canSearchLocations,
    pinned: pinnedCity,
  })

  const loadOfficeOptionsBase = useDeliveryLocationOptions({
    id: serviceId,
    apiKey: effectiveApiKey,
    kind: 'office',
    parentId: senderCityId || undefined,
    enabled: canSearchLocations && Boolean(senderCityId),
    pinned: pinnedOffice,
  })

  const loadCityOptions = useCallback(async (args?: { query?: string, selectedValue?: string[] }) => {
    const items = await loadCityOptionsBase(args)
    lastCityOptionsRef.current = items
    return items
  }, [loadCityOptionsBase])

  const loadOfficeOptions = useCallback(async (args?: { query?: string, selectedValue?: string[] }) => {
    const items = await loadOfficeOptionsBase(args)
    lastOfficeOptionsRef.current = items
    return items
  }, [loadOfficeOptionsBase])

  return (
    <div key="novaposhta-fields" className="space-y-1">
      <FormField
        control={form.control}
        name="apiKey"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <p>
                {t('page.delivery-services.form.apiKey')}
                <span className="text-destructive ml-1">*</span>
              </p>
            </FormLabel>
            <FormControl>
              <Input
                placeholder={t('page.delivery-services.form.apiKey')}
                className="w-full"
                {...field}
                disabled={isLoading}
                onFocus={() => {
                  if (field.value === DELIVERY_SERVICE_API_KEY_MASK)
                    field.onChange('')
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <p>
                {t('page.delivery-services.form.phone')}
                <span className="text-destructive ml-1">*</span>
              </p>
            </FormLabel>
            <FormControl>
              <PhoneInput
                placeholder={t('component.phoneInput.placeholder')}
                international
                value={field.value}
                onChange={field.onChange}
                disabled={isLoading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="senderCityId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <p>
                {t('page.delivery-services.form.senderCity')}
                <span className="text-destructive ml-1">*</span>
              </p>
            </FormLabel>
            <FormControl>
              <AsyncSelectNew
                value={field.value}
                onChange={(value) => {
                  const nextId = String(value || '')
                  field.onChange(nextId)
                  form.setValue('senderOfficeId', '')
                  form.setValue('senderOfficeName', '')
                  const selected = lastCityOptionsRef.current.find(item => item.id === nextId)
                  form.setValue('senderCityName', selected?.name ?? '')
                }}
                loadOptions={loadCityOptions}
                renderOption={e => e.name}
                getDisplayValue={e => e.name}
                getOptionValue={e => e.id}
                disabled={isLoading || !canSearchLocations}
                searchable
                clearable
                isForm={false}
                placeholder={
                  canSearchLocations
                    ? t('page.delivery-services.form.senderCity')
                    : t('page.delivery-services.form.apiKeyFirst')
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="senderOfficeId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <p>
                {t('page.delivery-services.form.senderOffice')}
                <span className="text-destructive ml-1">*</span>
              </p>
            </FormLabel>
            <FormControl>
              <AsyncSelectNew
                value={field.value}
                onChange={(value) => {
                  const nextId = String(value || '')
                  field.onChange(nextId)
                  const selected = lastOfficeOptionsRef.current.find(item => item.id === nextId)
                  form.setValue('senderOfficeName', selected?.name ?? '')
                }}
                loadOptions={loadOfficeOptions}
                renderOption={e => e.name}
                getDisplayValue={e => e.name}
                getOptionValue={e => e.id}
                disabled={isLoading || !canSearchLocations || !senderCityId}
                searchable
                clearable
                isForm={false}
                placeholder={t('page.delivery-services.form.senderOffice')}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
