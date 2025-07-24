import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { useCreateOrderContext } from '@/contexts'

export function ProductSelectedTotal() {
  const { t, i18n } = useTranslation()
  const { informationForm } = useCreateOrderContext()

  const items = informationForm.getValues('items') || []

  const totalsByCurrency = items.reduce((acc, item) => {
    const currency = item.selectedCurrency?.symbols?.[i18n.language] || null
    const subtotal = (item.quantity || 0) * (item.selectedPrice || 0)

    if (!currency)
      return acc

    acc[currency] = (acc[currency] || 0) + subtotal
    return acc
  }, {} as Record<string, number>)

  const totalsByCategory = items.reduce((acc, item) => {
    const quantity = item.quantity || 0

    item.categories?.forEach((category) => {
      const name = category?.names?.[i18n.language] || t('common.unknown-category')
      acc[name] = (acc[name] || 0) + quantity
    })

    return acc
  }, {} as Record<string, number>)

  return (
    <div className="flex flex-col items-end gap-2 mt-2">
      <div className="flex items-center flex-wrap gap-2">
        {Object.entries(totalsByCurrency).map(([currency, total]: [string, number]) => (
          <Badge key={currency}>
            {`${total.toFixed(2)} ${currency}`}
          </Badge>
        ))}
      </div>

      <div className="flex items-center flex-wrap gap-2">
        {Object.entries(totalsByCategory).map(([category, quantity]) => (
          <Badge key={category}>
            {`${category}: ${quantity}`}
          </Badge>
        ))}
      </div>
    </div>
  )
}
