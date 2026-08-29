import type { DeliveryTrackingIntervalUnit } from '@remnant/shared'
import {
  DELIVERY_TRACKING_INTERVAL_DEFAULT,
  DELIVERY_TRACKING_INTERVAL_PRESETS,
  DELIVERY_TRACKING_INTERVAL_SETTING_KEY,
  formatDeliveryTrackingInterval,
} from '@remnant/shared'
import { CircleHelp } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui'
import { useLocale } from '@/utils/hooks'
import { useSettingContext } from './context'

const CUSTOM_VALUE = '__custom__'

function parseStored(raw: string | undefined): { amount: number, unit: DeliveryTrackingIntervalUnit, isPreset: boolean } {
  const value = (raw ?? DELIVERY_TRACKING_INTERVAL_DEFAULT).trim()
  const match = /^(\d+)([mhd])$/.exec(value)
  if (match == null) {
    return { amount: 5, unit: 'm', isPreset: true }
  }

  const amount = Number(match[1])
  const unit = match[2] as DeliveryTrackingIntervalUnit
  const encoded = formatDeliveryTrackingInterval(amount, unit)
  return {
    amount,
    unit,
    isPreset: (DELIVERY_TRACKING_INTERVAL_PRESETS as readonly string[]).includes(encoded),
  }
}

export function DeliveryTrackingIntervalCard() {
  const { t } = useLocale()
  const { editSetting, isLoading, getSetting } = useSettingContext()
  const stored = getSetting(DELIVERY_TRACKING_INTERVAL_SETTING_KEY)?.value
  const parsed = useMemo(() => parseStored(stored), [stored])
  const [customDraft, setCustomDraft] = useState<{ amount: number, unit: DeliveryTrackingIntervalUnit } | null>(null)

  const selectValue = parsed.isPreset && customDraft == null
    ? formatDeliveryTrackingInterval(parsed.amount, parsed.unit)
    : CUSTOM_VALUE

  const customAmount = customDraft?.amount ?? parsed.amount
  const customUnit = customDraft?.unit ?? parsed.unit

  const save = (amount: number, unit: DeliveryTrackingIntervalUnit) => {
    editSetting({
      key: DELIVERY_TRACKING_INTERVAL_SETTING_KEY,
      value: formatDeliveryTrackingInterval(amount, unit),
    })
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-1.5 space-y-0">
        <CardTitle className="text-xl font-semibold">{t('page.settings.deliveryTrackingInterval.title')}</CardTitle>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="text-muted-foreground hover:text-foreground inline-flex">
              <CircleHelp className="size-4" />
              <span className="sr-only">{t('page.settings.deliveryTrackingInterval.description')}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">{t('page.settings.deliveryTrackingInterval.description')}</TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Select
          value={selectValue}
          disabled={isLoading}
          onValueChange={(value) => {
            if (value === CUSTOM_VALUE) {
              setCustomDraft({ amount: parsed.amount, unit: parsed.unit })
              return
            }
            setCustomDraft(null)
            const next = parseStored(value)
            save(next.amount, next.unit)
          }}
        >
          <SelectTrigger className="max-w-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DELIVERY_TRACKING_INTERVAL_PRESETS.map(preset => (
              <SelectItem key={preset} value={preset}>
                {t(`page.settings.deliveryTrackingInterval.preset.${preset}`)}
              </SelectItem>
            ))}
            <SelectItem value={CUSTOM_VALUE}>
              {t('page.settings.deliveryTrackingInterval.custom')}
            </SelectItem>
          </SelectContent>
        </Select>

        {selectValue === CUSTOM_VALUE
          ? (
              <div className="flex max-w-sm items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  step={1}
                  className="w-24"
                  disabled={isLoading}
                  value={customAmount}
                  onChange={(e) => {
                    const amount = Math.max(1, Number(e.target.value) || 1)
                    setCustomDraft({ amount, unit: customUnit })
                  }}
                  onBlur={() => save(customAmount, customUnit)}
                />
                <Select
                  value={customUnit}
                  disabled={isLoading}
                  onValueChange={(unit: DeliveryTrackingIntervalUnit) => {
                    setCustomDraft({ amount: customAmount, unit })
                    save(customAmount, unit)
                  }}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="m">{t('page.settings.deliveryTrackingInterval.unit.m')}</SelectItem>
                    <SelectItem value="h">{t('page.settings.deliveryTrackingInterval.unit.h')}</SelectItem>
                    <SelectItem value="d">{t('page.settings.deliveryTrackingInterval.unit.d')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )
          : null}

        <p className="text-muted-foreground text-sm">
          {t('page.settings.deliveryTrackingInterval.hint')}
        </p>
      </CardContent>
    </Card>
  )
}
