import { useTranslation } from 'react-i18next'
import { useCreateInventoryContext } from '../context'

export function ActionBar() {
  const { t } = useTranslation()
  const { inventory, isDraftReady } = useCreateInventoryContext()

  const title = isDraftReady && inventory?.seq
    ? t('page.create-inventory.title-continue', { seq: inventory.seq })
    : t('page.create-inventory.title')

  const description = isDraftReady
    ? t('page.create-inventory.description-continue')
    : t('page.create-inventory.description')

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
