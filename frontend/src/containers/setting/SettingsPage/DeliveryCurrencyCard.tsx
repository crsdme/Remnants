import { DELIVERY_CURRENCY_SETTING_KEY } from '@remnant/shared'
import { CircleHelp } from 'lucide-react'
import { useCurrencyQuery } from '@/api/hooks'
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

export function DeliveryCurrencyCard() {
  const { t, language } = useLocale()
  const { editSetting, isLoading, getSetting } = useSettingContext()
  const { currencies = [] } = useCurrencyQuery(
    { pagination: { full: true }, filters: { active: [true] } },
    { options: { placeholderData: prevData => prevData } },
  )

  const selected = getSetting(DELIVERY_CURRENCY_SETTING_KEY)?.value || NONE_VALUE

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-1.5 space-y-0">
        <CardTitle className="text-xl font-semibold">{t('page.settings.deliveryCurrency.title')}</CardTitle>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="text-muted-foreground hover:text-foreground inline-flex">
              <CircleHelp className="size-4" />
              <span className="sr-only">{t('page.settings.deliveryCurrency.description')}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">{t('page.settings.deliveryCurrency.description')}</TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent>
        <Select
          value={selected}
          disabled={isLoading}
          onValueChange={(value) => {
            editSetting({
              key: DELIVERY_CURRENCY_SETTING_KEY,
              value: value === NONE_VALUE ? '' : value,
            })
          }}
        >
          <SelectTrigger className="max-w-sm">
            <SelectValue placeholder={t('page.settings.deliveryCurrency.none')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE_VALUE}>
              {t('page.settings.deliveryCurrency.none')}
            </SelectItem>
            {currencies.map(currency => (
              <SelectItem key={currency.id} value={currency.id}>
                {currency.names?.[language] ?? currency.id}
                {currency.symbols?.[language] ? ` (${currency.symbols[language]})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}
