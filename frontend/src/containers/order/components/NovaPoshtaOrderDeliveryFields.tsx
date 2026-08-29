import type { DeliveryLocationDTO, LookupDeliveryShipmentData } from '@remnant/shared'
import type { UseFormReturn } from 'react-hook-form'
import type { ConvertibleLine } from './declaredValueFromItems'
import { DELIVERY_CURRENCY_SETTING_KEY } from '@remnant/shared'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import {
  useCurrencyExcangeRateQuery,
  useCurrencyQuery,
  useDeliveryLocationOptions,
  useDeliveryShipmentLookup,
  useSettingValue,
} from '@/api/hooks'
import { AsyncSelectNew } from '@/components/AsyncSelectNew'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  PhoneInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { fromMinor } from '@/utils/helpers'
import { useLocale } from '@/utils/hooks'
import { declaredValueFromItems, itemsConversionKey } from './declaredValueFromItems'
import { toE164Phone } from './orderDeliveryForm'

interface NovaPoshtaOrderDeliveryFieldsProps {
  form: UseFormReturn<any>
  deliveryServiceId?: string
  disabled?: boolean
}

function applyShipmentLookup(form: UseFormReturn<any>, data: LookupDeliveryShipmentData) {
  const opts = { shouldDirty: true, shouldValidate: true }
  if (data.method)
    form.setValue('delivery.method', data.method, opts)
  if (data.recipientName)
    form.setValue('delivery.recipientName', data.recipientName, opts)
  if (data.recipientPhone)
    form.setValue('delivery.recipientPhone', toE164Phone(data.recipientPhone), opts)
  if (data.city) {
    form.setValue('delivery.cityId', data.city.id, opts)
    form.setValue('delivery.cityName', data.city.name, opts)
  }
  else {
    form.setValue('delivery.cityId', '', opts)
    form.setValue('delivery.cityName', '', opts)
  }
  if (data.point) {
    form.setValue('delivery.pointId', data.point.id, opts)
    form.setValue('delivery.pointName', data.point.name, opts)
  }
  else {
    form.setValue('delivery.pointId', '', opts)
    form.setValue('delivery.pointName', '', opts)
  }
  if (data.seats != null)
    form.setValue('delivery.seats', data.seats, opts)
  if (data.declaredValueMinor != null)
    form.setValue('delivery.declaredValue', Number(fromMinor(data.declaredValueMinor)), opts)
  if (data.weightKg != null)
    form.setValue('delivery.weightKg', data.weightKg, opts)
  if (data.description != null && data.description !== '')
    form.setValue('delivery.description', data.description, opts)
  if (data.payer)
    form.setValue('delivery.payer', data.payer, opts)
  if (data.documentRef)
    form.setValue('delivery.providerRefs', { documentRef: data.documentRef }, opts)
  if (data.trackingNumber)
    form.setValue('delivery.trackingNumber', data.trackingNumber, opts)
}

export function NovaPoshtaOrderDeliveryFields({
  form,
  deliveryServiceId,
  disabled,
}: NovaPoshtaOrderDeliveryFieldsProps) {
  const { t, language } = useLocale()
  const npCurrencyId = useSettingValue(DELIVERY_CURRENCY_SETTING_KEY)
  const { currencies = [] } = useCurrencyQuery(
    { pagination: { full: true }, filters: { active: [true] } },
    { options: { placeholderData: prevData => prevData } },
  )
  const { items: exchangeRates = [] } = useCurrencyExcangeRateQuery({
    pagination: { current: 1, pageSize: 1000, full: true },
  })
  const npCurrency = currencies.find(currency => currency.id === npCurrencyId)
  const npCurrencySymbol = npCurrency?.symbols?.[language] || npCurrency?.names?.[language]

  const items = useWatch({ control: form.control, name: 'items' }) as ConvertibleLine[] | undefined
  const cityId = useWatch({ control: form.control, name: 'delivery.cityId' }) as string | undefined
  const cityName = useWatch({ control: form.control, name: 'delivery.cityName' }) as string | undefined
  const pointId = useWatch({ control: form.control, name: 'delivery.pointId' }) as string | undefined
  const pointName = useWatch({ control: form.control, name: 'delivery.pointName' }) as string | undefined
  const method = useWatch({ control: form.control, name: 'delivery.method' }) as string | undefined
  const pointKind = method === 'parcel_locker' ? 'parcel_locker' : 'office'

  const pinnedCity = useMemo<DeliveryLocationDTO | null>(() => {
    if (!cityId || !cityName)
      return null
    return { id: cityId, kind: 'city', name: cityName }
  }, [cityId, cityName])

  const pinnedPoint = useMemo<DeliveryLocationDTO | null>(() => {
    if (!pointId || !pointName)
      return null
    return { id: pointId, kind: pointKind, name: pointName, parentId: cityId || undefined }
  }, [cityId, pointId, pointKind, pointName])

  const lastCityOptionsRef = useRef<DeliveryLocationDTO[]>([])
  const lastPointOptionsRef = useRef<DeliveryLocationDTO[]>([])
  const lastLookedUpRef = useRef('')
  const freezeDeclaredRef = useRef(false)
  const declaredBaselineKeyRef = useRef<string | null>(null)
  const prevItemsKeyRef = useRef<string | null>(null)
  const prevRatesKeyRef = useRef<string | null>(null)
  const lookupShipment = useDeliveryShipmentLookup()

  const itemsKey = itemsConversionKey(items)
  const ratesKey = exchangeRates
    .map(rate => `${rate.fromCurrency.id}:${rate.toCurrency.id}:${rate.rate}`)
    .join(',')
  const declaredSourceKey = `${itemsKey}|${npCurrencyId ?? ''}|${ratesKey}`

  useEffect(() => {
    lastLookedUpRef.current = ''
    freezeDeclaredRef.current = false
    declaredBaselineKeyRef.current = null
    prevItemsKeyRef.current = null
    prevRatesKeyRef.current = null
  }, [deliveryServiceId])

  useEffect(() => {
    if (disabled)
      return

    if (npCurrencyId == null || npCurrencyId === '')
      return

    const next = declaredValueFromItems(items, npCurrencyId, exchangeRates)
    if (next == null)
      return

    const savedDeclared = Number(form.getValues('delivery.declaredValue') ?? 0)

    // First observation this session: keep form/DB value, remember baseline.
    if (declaredBaselineKeyRef.current === null) {
      declaredBaselineKeyRef.current = declaredSourceKey
      prevItemsKeyRef.current = itemsKey
      prevRatesKeyRef.current = ratesKey
      return
    }

    // Async hydration (edit form): items/rates arrive after first paint — keep DB value.
    const prevItemsKey = prevItemsKeyRef.current
    const prevRatesKey = prevRatesKeyRef.current
    const itemsHydrating = (prevItemsKey === '' || prevItemsKey == null) && itemsKey !== ''
    const ratesHydrating = (prevRatesKey === '' || prevRatesKey == null) && ratesKey !== ''
    if (savedDeclared > 0 && (itemsHydrating || ratesHydrating)) {
      prevItemsKeyRef.current = itemsKey
      prevRatesKeyRef.current = ratesKey
      declaredBaselineKeyRef.current = declaredSourceKey
      return
    }
    prevItemsKeyRef.current = itemsKey
    prevRatesKeyRef.current = ratesKey

    if (freezeDeclaredRef.current)
      return

    // Still on the opening snapshot — do not overwrite saved value.
    if (declaredSourceKey === declaredBaselineKeyRef.current)
      return

    if (form.getValues('delivery.declaredValue') !== next)
      form.setValue('delivery.declaredValue', next, { shouldDirty: true })
  }, [declaredSourceKey, disabled, exchangeRates, form, items, itemsKey, npCurrencyId, ratesKey])

  const loadCityOptionsBase = useDeliveryLocationOptions({
    id: deliveryServiceId,
    kind: 'city',
    enabled: Boolean(deliveryServiceId),
    pinned: pinnedCity,
  })

  const loadPointOptionsBase = useDeliveryLocationOptions({
    id: deliveryServiceId,
    kind: pointKind,
    parentId: cityId || undefined,
    enabled: Boolean(deliveryServiceId && cityId),
    pinned: pinnedPoint,
  })

  const loadCityOptions = useCallback(async (args?: { query?: string, selectedValue?: string[] }) => {
    const items = await loadCityOptionsBase(args)
    lastCityOptionsRef.current = items
    return items
  }, [loadCityOptionsBase])

  const loadPointOptions = useCallback(async (args?: { query?: string, selectedValue?: string[] }) => {
    const items = await loadPointOptionsBase(args)
    lastPointOptionsRef.current = items
    return items
  }, [loadPointOptionsBase])

  const hydrateFromTrackingNumber = useCallback(async (raw: string) => {
    const ttn = raw.trim()
    if (disabled || !deliveryServiceId || ttn.length < 8 || ttn === lastLookedUpRef.current)
      return

    try {
      const { data } = await lookupShipment.mutateAsync({
        id: deliveryServiceId,
        trackingNumber: ttn,
      })
      const item = data.data
      lastLookedUpRef.current = item.trackingNumber
      if (item.declaredValueMinor != null)
        freezeDeclaredRef.current = true
      applyShipmentLookup(form, item)

      if (!item.ownedByAccount) {
        toast.warning(t('page.order.delivery.foreignAccount.title'), {
          description: t('page.order.delivery.foreignAccount.description'),
        })
        return
      }

      toast.success(t(`response.title.${data.code}`), {
        description: t(`response.description.${data.code}`),
      })
    }
    catch (error) {
      const axiosError = error as { response?: { data?: { error?: { code?: string, message?: string, description?: string } } } }
      const apiError = axiosError.response?.data?.error
      const code = apiError?.code ?? 'undefined'
      toast.error(t(`error.title.${code}`), {
        description: `${t(`error.description.${code}`)} ${apiError?.description || apiError?.message || ''}`.trim(),
      })
    }
  }, [deliveryServiceId, disabled, form, lookupShipment, t])

  return (
    <div className="space-y-3">
      <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
        <FormField
          control={form.control}
          name="delivery.recipientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.order.delivery.recipientName')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('page.order.delivery.recipientName')}
                  className="w-full"
                  {...field}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="delivery.recipientPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.order.delivery.recipientPhone')}</FormLabel>
              <FormControl>
                <PhoneInput
                  placeholder={t('component.phoneInput.placeholder')}
                  international
                  value={field.value}
                  onChange={value => field.onChange(value ?? '')}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <FormField
          control={form.control}
          name="delivery.method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.order.delivery.method')}</FormLabel>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value)
                  form.setValue('delivery.pointId', '')
                  form.setValue('delivery.pointName', '')
                }}
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('page.order.delivery.method')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="office">
                    {t('page.order.delivery.method.office')}
                  </SelectItem>
                  <SelectItem value="parcel_locker">
                    {t('page.order.delivery.method.parcel_locker')}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="delivery.payer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.order.delivery.payer')}</FormLabel>
              <Select value={field.value} onValueChange={field.onChange} disabled={disabled}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('page.order.delivery.payer')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="sender">
                    {t('page.order.delivery.payer.sender')}
                  </SelectItem>
                  <SelectItem value="recipient">
                    {t('page.order.delivery.payer.recipient')}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="delivery.cityId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.order.delivery.city')}</FormLabel>
              <FormControl>
                <AsyncSelectNew
                  value={field.value}
                  onChange={(value) => {
                    const nextId = String(value || '')
                    field.onChange(nextId)
                    form.setValue('delivery.pointId', '')
                    form.setValue('delivery.pointName', '')
                    const selected = lastCityOptionsRef.current.find(item => item.id === nextId)
                    form.setValue('delivery.cityName', selected?.name ?? '')
                  }}
                  loadOptions={loadCityOptions}
                  renderOption={e => e.name}
                  getDisplayValue={e => e.name}
                  getOptionValue={e => e.id}
                  disabled={disabled || !deliveryServiceId}
                  searchable
                  clearable
                  isForm={false}
                  placeholder={t('page.order.delivery.city')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="delivery.pointId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {method === 'parcel_locker'
                  ? t('page.order.delivery.parcelLocker')
                  : t('page.order.delivery.office')}
              </FormLabel>
              <FormControl>
                <AsyncSelectNew
                  value={field.value}
                  onChange={(value) => {
                    const nextId = String(value || '')
                    field.onChange(nextId)
                    const selected = lastPointOptionsRef.current.find(item => item.id === nextId)
                    form.setValue('delivery.pointName', selected?.name ?? '')
                  }}
                  loadOptions={loadPointOptions}
                  renderOption={e => e.name}
                  getDisplayValue={e => e.name}
                  getOptionValue={e => e.id}
                  disabled={disabled || !cityId}
                  searchable
                  clearable
                  isForm={false}
                  placeholder={
                    method === 'parcel_locker'
                      ? t('page.order.delivery.parcelLocker')
                      : t('page.order.delivery.office')
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <FormField
          control={form.control}
          name="delivery.seats"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.order.delivery.seats')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  className="w-full"
                  {...field}
                  disabled={disabled}
                  onChange={e => field.onChange(Math.max(1, Number(e.target.value) || 1))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="delivery.declaredValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.order.delivery.declaredValue')}</FormLabel>
              <FormControl>
                <InputGroup data-disabled={disabled ? true : undefined}>
                  <InputGroupInput
                    type="number"
                    min={0}
                    step="0.01"
                    {...field}
                    disabled={disabled}
                    onChange={(e) => {
                      freezeDeclaredRef.current = true
                      field.onChange(Number(e.target.value) || 0)
                    }}
                  />
                  {npCurrencySymbol
                    ? (
                        <InputGroupAddon align="inline-end">
                          <InputGroupText>{npCurrencySymbol}</InputGroupText>
                        </InputGroupAddon>
                      )
                    : null}
                </InputGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="delivery.weightKg"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.order.delivery.weight')}</FormLabel>
              <FormControl>
                <InputGroup data-disabled={disabled ? true : undefined}>
                  <InputGroupInput
                    type="number"
                    min={0}
                    step="0.1"
                    value={field.value ?? ''}
                    disabled={disabled}
                    onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>{t('page.order.delivery.weightUnit')}</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="delivery.trackingNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.order.delivery.trackingNumber')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('page.order.delivery.trackingNumber')}
                  className="w-full"
                  {...field}
                  disabled={disabled || lookupShipment.isPending}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter')
                      return
                    event.preventDefault()
                    void hydrateFromTrackingNumber(field.value ?? '')
                  }}
                  onBlur={() => {
                    field.onBlur()
                    void hydrateFromTrackingNumber(field.value ?? '')
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="delivery.description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('page.order.delivery.description')}</FormLabel>
            <FormControl>
              <Input
                placeholder={t('page.order.delivery.description')}
                className="w-full"
                {...field}
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
