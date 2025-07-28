import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'

export function ProductSelectedTotal({ products }: { products: any[] }) {
  const { t, i18n } = useTranslation()

  const totalsByCategory = products.reduce((acc, item) => {
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
        {Object.entries(totalsByCategory).map(([category, quantity]) => (
          <Badge key={category}>
            {`${category}: ${quantity}`}
          </Badge>
        ))}
      </div>
    </div>
  )
}
