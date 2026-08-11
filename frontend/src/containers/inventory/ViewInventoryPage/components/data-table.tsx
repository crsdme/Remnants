import type { InventoryItemViewFilter } from '@remnant/shared'
import { ClipboardList, Package } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  Badge,
  Button,
  Input,
  Separator,
  Skeleton,
} from '@/components/ui'
import { CountingTable } from '@/containers/inventory/CreateInventoryPage/components/CountingTable'
import { useLocale } from '@/utils/hooks'
import { cn } from '@/utils/lib/utils'
import { useViewInventoryContext } from '../context'

const VIEW_FILTERS: InventoryItemViewFilter[] = ['all', 'uncounted', 'counted', 'mismatch']

export function DataTable() {
  const { t, language } = useLocale()
  const navigate = useNavigate()
  const {
    inventory,
    isLoading,
    isItemsLoading,
    inventoryItems,
    inventoryItemsCount,
    progress,
    viewFilter,
    setViewFilter,
    search,
    setSearch,
    pagination,
    setPagination,
  } = useViewInventoryContext()

  const countedPercent = progress && progress.total > 0
    ? Math.round((progress.counted / progress.total) * 100)
    : 0

  const filterCount = (view: InventoryItemViewFilter) => {
    if (!progress)
      return ''
    if (view === 'all')
      return ` (${progress.total})`
    if (view === 'uncounted')
      return ` (${progress.uncounted})`
    if (view === 'counted')
      return ` (${progress.counted})`
    return ` (${progress.mismatches})`
  }

  const statusBadge = {
    draft: 'default',
    confirmed: 'success',
    cancelled: 'destructive',
  } as const

  if (isLoading && !inventory) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    )
  }

  if (!inventory) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        {t('page.view-inventory.notFound')}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="size-5 shrink-0" />
          <p className="text-lg font-bold">{t('page.view-inventory.information-form.title')}</p>
          <Separator className="flex-1" />
          <Badge variant={statusBadge[inventory.status as keyof typeof statusBadge] ?? 'default'}>
            {t(`page.inventories.table.status.${inventory.status.toLowerCase()}`)}
          </Badge>
        </div>

        <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">{t('page.create-inventory.form.warehouse')}</p>
            <p className="font-medium">{inventory.warehouse?.names?.[language] ?? '—'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('page.create-inventory.form.categories')}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {inventory.categories.map(category => (
                <Badge key={category.id} variant="outline">
                  {category.names?.[language] ?? category.id}
                </Badge>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-muted-foreground">{t('page.create-inventory.form.comment')}</p>
            <p className="font-medium whitespace-pre-wrap">{inventory.comment?.trim() || '—'}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <Package className="size-5 shrink-0" />
          <p className="text-lg font-bold">{t('page.view-inventory.results.title')}</p>
          <Separator className="flex-1" />
        </div>

        {progress && (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <p>
                {t('page.create-inventory.progress.label', {
                  counted: progress.counted,
                  total: progress.total,
                })}
              </p>
              <p className="text-muted-foreground">
                {t('page.create-inventory.progress.mismatches', { count: progress.mismatches })}
              </p>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${countedPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {VIEW_FILTERS.map(view => (
              <Button
                key={view}
                type="button"
                size="sm"
                variant={viewFilter === view ? 'default' : 'outline'}
                className={cn(viewFilter === view && 'pointer-events-none')}
                onClick={() => setViewFilter(view)}
              >
                {t(`page.create-inventory.filter.${view}`)}
                {filterCount(view)}
              </Button>
            ))}
          </div>
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('page.create-inventory.search.placeholder')}
            className="sm:max-w-xs"
          />
        </div>

        <CountingTable
          items={inventoryItems}
          itemsCount={inventoryItemsCount}
          isLoading={isItemsLoading}
          readOnly
          pagination={pagination}
          changePagination={setPagination}
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={() => void navigate('/inventories')}
        >
          {t('button.back')}
        </Button>
      </div>
    </div>
  )
}
