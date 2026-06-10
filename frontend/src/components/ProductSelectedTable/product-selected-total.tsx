import { Badge } from '@/components/ui/badge'
import { useLocale } from '@/utils/hooks'

export function ProductSelectedTotal({ products }: { products: any[] }) {
  const { t, language } = useLocale()

  const totalsByCategory = products.reduce((acc, item) => {
    const quantity = item.lineQuantity || 0

    item.categories?.forEach((category: any) => {
      const name = category?.names?.[language] || t('common.unknown-category')
      acc[name] = (acc[name] || 0) + quantity
    })

    return acc
  }, {} as Record<string, number>)

  return (
    <div className="flex flex-col items-end gap-2 mt-2">
      <div className="flex items-center flex-wrap gap-2">
        {Object.entries(totalsByCategory).map(([category, quantity]) => (
          <Badge key={category}>
            {`${category}: ${quantity?.toString() ?? '0'}`}
          </Badge>
        ))}
      </div>
    </div>
  )
}
