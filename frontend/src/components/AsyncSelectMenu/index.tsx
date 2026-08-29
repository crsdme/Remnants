import type { ReactNode } from 'react'
import { Check, ChevronDown, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  FormControl,
  FormMessage,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui'
import { useDebounceValue } from '@/utils/hooks/useDebounceValue/useDebounceValue'
import { cn } from '@/utils/lib/utils'

export interface Option {
  value: string
  label: string
  disabled?: boolean
  description?: string
  icon?: ReactNode
}

export interface AsyncSelectProps<T> {
  /**
   * Search text → menu options.
   * Called on open and on every debounced search change.
   */
  loadSearchOptions: (query: string) => Promise<T[]>

  /**
   * Optional: fetch full objects for already-selected ids.
   * Useful for edit forms where the form value already contains ids,
   * but the option objects are not loaded yet.
   */
  loadSelectedOptions?: (ids: string[]) => Promise<T[]>

  renderOption: (option: T) => ReactNode
  getOptionValue: (option: T) => string
  getDisplayValue: (option: T) => ReactNode

  onChange?: (value: string | string[]) => void
  value?: string | string[]
  defaultValue?: string | string[]

  name?: string
  field?: any
  placeholder?: string
  className?: string
  triggerClassName?: string
  notFound?: ReactNode
  loadingSkeleton?: ReactNode

  isForm?: boolean
  multi?: boolean
  clearable?: boolean
  searchable?: boolean
  disabled?: boolean
  selectFirstOption?: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toIdArray(v: unknown): string[] {
  if (Array.isArray(v))
    return v.filter((x): x is string => typeof x === 'string' && x.length > 0)

  if (typeof v === 'string')
    return v.length ? [v] : []

  return []
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AsyncSelectMenu<T>({
  loadSearchOptions,
  loadSelectedOptions,
  renderOption,
  getOptionValue,
  getDisplayValue,
  onChange,
  value,
  name,
  placeholder,
  disabled = false,
  className,
  triggerClassName,
  multi = false,
  clearable = false,
  searchable = false,
  isForm = true,
  field,
  loadingSkeleton,
  notFound,
  selectFirstOption = false,
  defaultValue,
}: AsyncSelectProps<T>) {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [uncontrolledSelectedIds, setUncontrolledSelectedIds] = useState<string[]>(
    () => toIdArray(defaultValue),
  )

  /**
   * Main option cache: id → full option object.
   *
   * cacheRef is used inside effects to check the actual latest cache
   * without forcing repeated hydration calls because of Map reference changes.
   */
  const cacheRef = useRef<Map<string, T>>(new Map())
  const [cache, setCache] = useState<Map<string, T>>(() => cacheRef.current)

  /**
   * Prevents duplicated loadSelectedOptions requests.
   *
   * hydratingSelectedIdsRef:
   * id is currently being loaded.
   *
   * hydratedSelectedIdsRef:
   * id has already been requested once.
   * This prevents endless retries when API returns empty result for selected id.
   */
  const hydratingSelectedIdsRef = useRef<Set<string>>(new Set())
  const hydratedSelectedIdsRef = useRef<Set<string>>(new Set())

  /**
   * Per-query menu id cache.
   * query → option ids
   *
   * This prevents repeated loadSearchOptions calls for the same search query
   * while the component is mounted.
   */
  const menuIdsByQueryRef = useRef<Map<string, string[]>>(new Map())

  /**
   * Used to ignore stale search responses.
   */
  const requestIdRef = useRef(0)

  const [menuOptionIds, setMenuOptionIds] = useState<string[]>([])

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounceValue(search, 200)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const [popoverWidth, setPopoverWidth] = useState<number>()

  // ---------------------------------------------------------------------------
  // Controlled vs uncontrolled
  // ---------------------------------------------------------------------------

  const controlled = value !== undefined

  const selectedIds = useMemo(
    () => (controlled ? toIdArray(value) : uncontrolledSelectedIds),
    [controlled, value, uncontrolledSelectedIds],
  )

  const setSelectedSafe = useCallback(
    (next: string[] | string) => {
      if (!controlled)
        setUncontrolledSelectedIds(toIdArray(next))
    },
    [controlled],
  )

  // ---------------------------------------------------------------------------
  // Cache helpers
  // ---------------------------------------------------------------------------

  const mergeIntoCache = useCallback(
    (list: T[]) => {
      if (!list.length)
        return

      setCache((prev) => {
        const next = new Map(prev)
        let changed = false

        for (const opt of list) {
          const id = getOptionValue(opt)

          if (prev.get(id) !== opt) {
            next.set(id, opt)
            changed = true
          }

          hydratedSelectedIdsRef.current.add(id)
          hydratingSelectedIdsRef.current.delete(id)
        }

        const finalCache = changed ? next : prev
        cacheRef.current = finalCache

        return finalCache
      })
    },
    [getOptionValue],
  )

  useEffect(() => {
    cacheRef.current = cache
  }, [cache])

  // ---------------------------------------------------------------------------
  // Popover width sync
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const el = triggerRef.current

    if (!el)
      return

    const ro = new ResizeObserver(() => {
      setPopoverWidth(el.offsetWidth)
    })

    ro.observe(el)

    return () => ro.disconnect()
  }, [])

  // ---------------------------------------------------------------------------
  // Reset per-query cache when the search loader changes
  // ---------------------------------------------------------------------------

  useEffect(() => {
    menuIdsByQueryRef.current.clear()
    setMenuOptionIds([])
  }, [loadSearchOptions])

  // ---------------------------------------------------------------------------
  // Fetch menu options on open / search change
  // ---------------------------------------------------------------------------

  const fetchMenu = useCallback(
    async (query: string) => {
      const normalizedQuery = query.trim()
      const cachedIds = menuIdsByQueryRef.current.get(normalizedQuery)

      if (cachedIds) {
        setMenuOptionIds(cachedIds)
        return
      }

      const rid = ++requestIdRef.current

      setLoading(true)
      setError(null)

      try {
        const result = await loadSearchOptions(normalizedQuery)

        if (rid !== requestIdRef.current)
          return

        mergeIntoCache(result)

        const ids = result.map(getOptionValue)

        menuIdsByQueryRef.current.set(normalizedQuery, ids)
        setMenuOptionIds(ids)

        if (
          selectFirstOption
          && !controlled
          && selectedIds.length === 0
          && ids.length > 0
        ) {
          const firstId = ids[0]

          setSelectedSafe([firstId])
          onChange?.(multi ? [firstId] : firstId)
        }
      }
      catch (e) {
        if (rid !== requestIdRef.current)
          return

        setError(e instanceof Error ? e.message : 'Failed to fetch options')
        setMenuOptionIds([])
      }
      finally {
        if (rid === requestIdRef.current)
          setLoading(false)
      }
    },
    [
      loadSearchOptions,
      mergeIntoCache,
      getOptionValue,
      selectFirstOption,
      controlled,
      selectedIds.length,
      setSelectedSafe,
      onChange,
      multi,
    ],
  )

  useEffect(() => {
    if (!open)
      return

    void fetchMenu(debouncedSearch || '')
  }, [open, debouncedSearch, fetchMenu])

  // ---------------------------------------------------------------------------
  // Hydrate selected ids only when they are missing from current cache.
  //
  // Rules:
  // 1. If selected option already exists in cache → no request.
  // 2. If selected id is already being hydrated → no request.
  // 3. If selected id was already requested once → no repeated request.
  //
  // This prevents duplicated requests after selecting an option from search,
  // because selected option is already saved into cache by fetchMenu().
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (selectedIds.length === 0 || !loadSelectedOptions)
      return

    const missing = selectedIds.filter((id) => {
      return (
        !cacheRef.current.has(id)
        && !hydratingSelectedIdsRef.current.has(id)
        && !hydratedSelectedIdsRef.current.has(id)
      )
    })

    if (missing.length === 0)
      return

    missing.forEach((id) => {
      hydratingSelectedIdsRef.current.add(id)
    })

    let cancelled = false

    void (async () => {
      try {
        const res = await loadSelectedOptions(missing)

        if (cancelled)
          return

        mergeIntoCache(res)

        const receivedIds = new Set(res.map(getOptionValue))

        for (const id of missing) {
          hydratingSelectedIdsRef.current.delete(id)
          hydratedSelectedIdsRef.current.add(id)

          /**
           * If API did not return this id, we still mark it as hydrated.
           * Otherwise the component can retry this id forever on every render.
           */
          if (!receivedIds.has(id)) {
            // Optional: console.warn(`AsyncSelect option not found: ${id}`)
          }
        }
      }
      catch {
        for (const id of missing) {
          hydratingSelectedIdsRef.current.delete(id)
        }

        /**
         * Important:
         * We do NOT add failed ids to hydratedSelectedIdsRef here.
         * This allows retry if parent re-renders or selectedIds changes later.
         */
      }
    })()

    return () => {
      cancelled = true
    }
  }, [
    selectedIds,
    loadSelectedOptions,
    mergeIntoCache,
    getOptionValue,
  ])

  // ---------------------------------------------------------------------------
  // Selection handlers
  // ---------------------------------------------------------------------------

  const selectId = useCallback(
    (id: string) => {
      const exists = selectedIds.includes(id)

      if (multi) {
        const next = exists
          ? selectedIds.filter(v => v !== id)
          : [...selectedIds, id]

        setSelectedSafe(next)
        onChange?.(next)

        return
      }

      if (clearable && exists) {
        setSelectedSafe([])
        onChange?.('')

        return
      }

      setSelectedSafe([id])
      onChange?.(id)
      setOpen(false)
    },
    [
      multi,
      clearable,
      selectedIds,
      onChange,
      setSelectedSafe,
    ],
  )

  const removeTag = useCallback(
    (id: string) => {
      if (!multi)
        return

      const next = selectedIds.filter(v => v !== id)

      setSelectedSafe(next)
      onChange?.(next)
    },
    [
      multi,
      selectedIds,
      onChange,
      setSelectedSafe,
    ],
  )

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen)

    if (!nextOpen)
      setSearch('')
  }, [])

  // ---------------------------------------------------------------------------
  // Derived display lists
  // ---------------------------------------------------------------------------

  const menuOptions: T[] = useMemo(
    () => menuOptionIds.map(id => cache.get(id)).filter(isDefined),
    [menuOptionIds, cache],
  )

  const selectedOptions: T[] = useMemo(
    () => selectedIds.map(id => cache.get(id)).filter(isDefined),
    [selectedIds, cache],
  )

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const triggerButton = (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={open}
      className={cn(
        'w-full max-w-full min-w-0 justify-between min-h-9',
        disabled && 'opacity-50 cursor-not-allowed',
        multi && selectedOptions.length > 0 && 'h-auto p-1 has-[>svg]:pl-1',
        triggerClassName,
      )}
      disabled={disabled}
      {...field}
      ref={triggerRef}
      type="button"
    >
      <SelectedDisplay
        selectedOptions={selectedOptions}
        multi={multi}
        getOptionValue={getOptionValue}
        getDisplayValue={getDisplayValue}
        placeholder={placeholder || t('component.asyncSelect.placeholder')}
        onRemove={removeTag}
      />

      <ChevronDown className="opacity-50" size={10} />
    </Button>
  )

  return (
    <>
      <Popover modal open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          {isForm ? <FormControl>{triggerButton}</FormControl> : triggerButton}
        </PopoverTrigger>

        {isForm && <FormMessage />}

        <PopoverContent
          style={{ width: popoverWidth }}
          className={cn('p-0 overflow-hidden', className)}
          onWheel={e => e.stopPropagation()}
        >
          <Command shouldFilter={false} className="h-auto">
            {searchable && (
              <div className="relative w-full">
                <CommandInput
                  placeholder={t('component.asyncSelect.searchPlaceholder')}
                  value={search}
                  onValueChange={setSearch}
                  className="w-full text-muted-foreground"
                />

                {loading && menuOptions.length > 0 && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                )}
              </div>
            )}

            <CommandList className="w-full min-h-0 overscroll-contain">
              {error && (
                <div className="p-4 text-destructive text-center">
                  {error}
                </div>
              )}

              {loading && menuOptions.length === 0 && (
                loadingSkeleton || <DefaultLoadingSkeleton />
              )}

              {!loading && !error && menuOptions.length === 0 && (
                notFound || (
                  <CommandEmpty>
                    {t('component.asyncSelect.noResultsMessage')}
                  </CommandEmpty>
                )
              )}

              <CommandGroup>
                {menuOptions.map((option) => {
                  const id = getOptionValue(option)
                  const isSelected = selectedIds.includes(id)

                  return (
                    <CommandItem
                      key={id}
                      value={id}
                      onSelect={selectId}
                    >
                      {renderOption(option)}

                      <Check
                        className={cn(
                          'ml-auto h-3 w-3',
                          isSelected ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {name && (
        <input
          type="hidden"
          name={name}
          value={selectedIds.join(',')}
          readOnly
        />
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function DefaultLoadingSkeleton() {
  return (
    <CommandGroup>
      {[1, 2, 3].map(i => (
        <CommandItem key={i} disabled>
          <div className="flex items-center gap-2 w-full">
            <div className="h-6 w-6 rounded-full animate-pulse bg-muted" />

            <div className="flex flex-col flex-1 gap-1">
              <div className="h-4 w-24 animate-pulse bg-muted rounded" />
              <div className="h-3 w-16 animate-pulse bg-muted rounded" />
            </div>
          </div>
        </CommandItem>
      ))}
    </CommandGroup>
  )
}

interface SelectedDisplayProps<T> {
  selectedOptions: T[]
  multi: boolean
  getOptionValue: (opt: T) => string
  getDisplayValue: (opt: T) => ReactNode
  placeholder?: ReactNode
  onRemove?: (val: string) => void
}

function SelectedDisplay<T>({
  selectedOptions,
  multi,
  getOptionValue,
  getDisplayValue,
  placeholder,
  onRemove,
}: SelectedDisplayProps<T>) {
  if (selectedOptions.length === 0) {
    return (
      <p className="text-muted-foreground">
        {placeholder}
      </p>
    )
  }

  if (!multi) {
    return (
      <span className="block overflow-hidden whitespace-nowrap max-w-full truncate">
        {getDisplayValue(selectedOptions[0])}
      </span>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {selectedOptions.map(option => (
        <span
          key={getOptionValue(option)}
          className="flex items-center bg-muted rounded px-2 py-1 text-xs gap-1"
        >
          {getDisplayValue(option)}

          {onRemove && (
            <span
              onClick={(e) => {
                e.stopPropagation()
                onRemove(getOptionValue(option))
              }}
              className="ml-1 cursor-pointer text-muted-foreground hover:text-destructive"
              aria-label="remove"
            >
              ×
            </span>
          )}
        </span>
      ))}
    </div>
  )
}
