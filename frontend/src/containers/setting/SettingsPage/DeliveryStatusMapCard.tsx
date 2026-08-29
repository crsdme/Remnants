import type { DeliveryStatusGroup, DeliveryStatusMap } from '@remnant/shared'
import { DELIVERY_STATUS_GROUPS, DELIVERY_STATUS_MAP_SETTING_KEY, deliveryStatusMapSchema } from '@remnant/shared'
import { CircleHelp } from 'lucide-react'
import { useOrderStatusQuery } from '@/api/hooks'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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

const NONE_VALUE = '__none__'

function parseStatusMap(raw: string | undefined): DeliveryStatusMap {
  if (raw == null || raw === '')
    return {}
  try {
    const parsed = JSON.parse(raw) as unknown
    const result = deliveryStatusMapSchema.safeParse(parsed)
    return result.success ? result.data : {}
  }
  catch {
    return {}
  }
}

export function DeliveryStatusMapCard() {
  const { t, language } = useLocale()
  const { editSetting, isLoading, getSetting } = useSettingContext()
  const { orderStatuses = [] } = useOrderStatusQuery(
    { pagination: { full: true } },
    { options: { placeholderData: prevData => prevData } },
  )

  const statusMap = parseStatusMap(getSetting(DELIVERY_STATUS_MAP_SETTING_KEY)?.value)

  const saveGroup = (group: DeliveryStatusGroup, orderStatusId: string) => {
    const next: DeliveryStatusMap = { ...statusMap }
    if (orderStatusId === '' || orderStatusId === NONE_VALUE)
      delete next[group]
    else
      next[group] = orderStatusId

    editSetting({
      key: DELIVERY_STATUS_MAP_SETTING_KEY,
      value: next,
    })
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-1.5 space-y-0">
        <CardTitle className="text-xl font-semibold">{t('page.settings.deliveryStatusMap.title')}</CardTitle>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="text-muted-foreground hover:text-foreground inline-flex">
              <CircleHelp className="size-4" />
              <span className="sr-only">{t('page.settings.deliveryStatusMap.description')}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">{t('page.settings.deliveryStatusMap.description')}</TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {DELIVERY_STATUS_GROUPS.map((group) => {
          const selected = statusMap[group] ?? NONE_VALUE
          return (
            <div key={group} className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <p className="text-sm">{t(`page.settings.deliveryStatusMap.group.${group}`)}</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-muted-foreground hover:text-foreground inline-flex">
                      <CircleHelp className="size-3.5" />
                      <span className="sr-only">{t(`page.settings.deliveryStatusMap.groupHint.${group}`)}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    {t(`page.settings.deliveryStatusMap.groupHint.${group}`)}
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select
                value={selected}
                disabled={isLoading}
                onValueChange={value => saveGroup(group, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('page.settings.deliveryStatusMap.none')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>
                    {t('page.settings.deliveryStatusMap.none')}
                  </SelectItem>
                  {orderStatuses.map(status => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.names?.[language] ?? status.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
