import type { SiteSyncItemDTO, SiteSyncSourceType } from '@remnant/shared'
import { useQueryClient } from '@tanstack/react-query'
import { Unlink } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { useSiteSyncMappingQuery, useSiteSyncMappingSave } from '@/api/hooks'
import { getSiteSyncSiteItems } from '@/api/requests'
import { TablePagination } from '@/components'
import { AsyncSelectNew } from '@/components/AsyncSelectNew'
import { Button, Input, Skeleton } from '@/components/ui'
import { useDebounceValue, useLocale } from '@/utils/hooks'

function localizedName(names: Record<string, string> | undefined, language: string) {
  if (names == null)
    return '—'
  return names[language] || names.ru || names.en || Object.values(names).find(Boolean) || '—'
}

function categoryPath(
  item: SiteSyncItemDTO,
  byId: Map<string, SiteSyncItemDTO>,
  language: string,
) {
  const parts: string[] = []
  const seen = new Set<string>()
  let current: SiteSyncItemDTO | undefined = item
  while (current != null && !seen.has(current.id)) {
    seen.add(current.id)
    parts.unshift(localizedName(current.names, language))
    current = current.parentId ? byId.get(current.parentId) : undefined
  }
  return parts.join(' / ')
}

function orderCategoryTree(items: SiteSyncItemDTO[], language: string) {
  const byId = new Map(items.map(item => [item.id, item]))
  const byParent = new Map<string, SiteSyncItemDTO[]>()
  const roots: SiteSyncItemDTO[] = []

  for (const item of items) {
    if (item.parentId && byId.has(item.parentId)) {
      const children = byParent.get(item.parentId) ?? []
      children.push(item)
      byParent.set(item.parentId, children)
    }
    else {
      roots.push(item)
    }
  }

  const result: SiteSyncItemDTO[] = []
  const walk = (nodes: SiteSyncItemDTO[]) => {
    const sorted = [...nodes].sort((a, b) => {
      return localizedName(a.names, language).localeCompare(localizedName(b.names, language), language)
    })
    for (const node of sorted) {
      result.push(node)
      walk(byParent.get(node.id) ?? [])
    }
  }
  walk(roots)
  return result
}

function SiteOptionLabel({
  item,
  language,
  path,
}: {
  item: SiteSyncItemDTO
  language: string
  path?: string
}) {
  return (
    <span className="flex items-center gap-2 min-w-0 w-full">
      <span className="truncate">{path || localizedName(item.names, language)}</span>
      <span className="text-muted-foreground shrink-0 tabular-nums text-xs">
        #
        {item.id}
      </span>
    </span>
  )
}

export function MappingTab({
  siteId,
  sourceType,
  compact = false,
}: {
  siteId: string
  sourceType: SiteSyncSourceType
  compact?: boolean
}) {
  const { t, language } = useLocale()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 })
  const debouncedSearch = useDebounceValue(search, 300)
  const isProduct = sourceType === 'product'
  const isCategory = sourceType === 'category'

  const params = {
    id: siteId,
    sourceType,
    names: isProduct ? debouncedSearch || undefined : undefined,
    pagination: isProduct
      ? pagination
      : { current: 1, pageSize: 100, full: true },
  }

  const { crmItems, siteItems, links, total, isLoading, isFetching, isError, errorCode } = useSiteSyncMappingQuery(params)

  const siteById = useMemo(() => new Map(siteItems.map(item => [item.id, item])), [siteItems])

  const linkBySource = useMemo(() => {
    return new Map(links.map(link => [link.sourceId, link.externalIds]))
  }, [links])

  const saveMapping = useSiteSyncMappingSave({
    options: {
      onSuccess: ({ data }) => {
        void queryClient.invalidateQueries({ queryKey: ['sites', 'sync-mapping'] })
        toast.success(t(`response.title.${data.code}`), {
          description: t(`response.description.${data.code}`),
        })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), { description: `${t(`error.description.${error.code}`)} ${error.description || ''}` })
      },
    },
  })

  const loadSiteOptions = useCallback(
    async ({ query = '', selectedValue }: { query?: string, selectedValue?: string[] } = {}) => {
      if (isProduct) {
        const response = await getSiteSyncSiteItems({
          id: siteId,
          sourceType: 'product',
          query: selectedValue && selectedValue.length > 0 ? undefined : query,
          ids: selectedValue && selectedValue.length > 0 ? selectedValue : undefined,
        })
        return response.data.data.items
      }

      const needle = query.trim().toLowerCase()
      if (selectedValue && selectedValue.length > 0)
        return siteItems.filter(item => selectedValue.includes(item.id))

      const ordered = isCategory ? orderCategoryTree(siteItems, language) : siteItems
      if (needle === '')
        return ordered

      return ordered.filter((item) => {
        const path = isCategory ? categoryPath(item, siteById, language) : ''
        return item.id.toLowerCase().includes(needle)
          || localizedName(item.names, language).toLowerCase().includes(needle)
          || path.toLowerCase().includes(needle)
      })
    },
    [isProduct, isCategory, siteId, siteItems, siteById, language],
  )

  const onChange = (sourceId: string, value: string | string[]) => {
    const externalIds = Array.isArray(value) ? value : (value ? [value] : [])
    saveMapping.mutate({
      id: siteId,
      sourceType,
      sourceId,
      externalIds,
    })
  }

  if (isError) {
    const titleKey = errorCode ? `error.title.${errorCode}` : 'page.sites.sync.loadError'
    const descriptionKey = errorCode ? `error.description.${errorCode}` : 'page.sites.sync.loadError'
    return (
      <div className="text-sm text-destructive mt-4 space-y-1">
        <p>{t(titleKey)}</p>
        {errorCode && <p className="text-muted-foreground">{t(descriptionKey)}</p>}
      </div>
    )
  }

  return (
    <div className={compact ? 'space-y-3' : 'space-y-3 mt-4'}>
      <p className="text-sm text-muted-foreground">{t(`page.sites.sync.hint.${sourceType}`)}</p>

      {isProduct && (
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPagination(prev => (prev.current === 1 ? prev : { ...prev, current: 1 }))
          }}
          placeholder={t('page.sites.sync.search')}
          className="max-w-sm"
        />
      )}

      <div className="border rounded-sm divide-y">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 px-3 py-2 text-sm font-medium text-muted-foreground">
          <span>{t('page.sites.sync.column.program')}</span>
          <span>{t('page.sites.sync.column.site')}</span>
          <span className="w-9" />
        </div>

        {(isLoading || isFetching) && crmItems.length === 0
          ? Array.from({ length: compact ? 2 : 6 }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={index} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 px-3 py-3">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-9" />
              </div>
            ))
          : crmItems.map(item => (
              <MappingRow
                key={item.id}
                item={item}
                language={language}
                value={linkBySource.get(item.id) ?? []}
                multi={isCategory}
                showPath={isCategory}
                siteById={siteById}
                disabled={saveMapping.isPending}
                placeholder={t('page.sites.sync.select')}
                unlinkLabel={t('page.sites.sync.unlink')}
                loadOptions={loadSiteOptions}
                onChange={value => onChange(item.id, value)}
              />
            ))}

        {!isLoading && crmItems.length === 0 && (
          <p className="px-3 py-6 text-sm text-center text-muted-foreground">{t('table.noResults')}</p>
        )}
      </div>

      {isProduct && (
        <TablePagination
          pagination={pagination}
          totalPages={Math.max(1, Math.ceil(total / pagination.pageSize))}
          changePagination={setPagination}
          totalCount={total}
        />
      )}
    </div>
  )
}

function MappingRow({
  item,
  language,
  value,
  multi,
  showPath,
  siteById,
  disabled,
  placeholder,
  unlinkLabel,
  loadOptions,
  onChange,
}: {
  item: SiteSyncItemDTO
  language: string
  value: string[]
  multi: boolean
  showPath: boolean
  siteById: Map<string, SiteSyncItemDTO>
  disabled: boolean
  placeholder: string
  unlinkLabel: string
  loadOptions: (params?: { query?: string, selectedValue?: string[] }) => Promise<SiteSyncItemDTO[]>
  onChange: (value: string | string[]) => void
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-3 px-3 py-3 items-center">
      <p className="text-sm truncate">{localizedName(item.names, language)}</p>
      <AsyncSelectNew
        isForm={false}
        searchable
        clearable
        multi={multi}
        disabled={disabled}
        placeholder={placeholder}
        value={multi ? value : (value[0] ?? '')}
        loadOptions={loadOptions}
        renderOption={option => (
          <SiteOptionLabel
            item={option}
            language={language}
            path={showPath ? categoryPath(option, siteById, language) : undefined}
          />
        )}
        getDisplayValue={option => (
          <SiteOptionLabel
            item={option}
            language={language}
            path={showPath ? categoryPath(option, siteById, language) : undefined}
          />
        )}
        getOptionValue={option => option.id}
        onChange={onChange}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled || value.length === 0}
        title={unlinkLabel}
        aria-label={unlinkLabel}
        onClick={() => onChange(multi ? [] : '')}
      >
        <Unlink className="h-4 w-4" />
      </Button>
    </div>
  )
}
