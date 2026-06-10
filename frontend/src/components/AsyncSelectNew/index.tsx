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
  icon?: React.ReactNode
}

export interface AsyncSelectProps<T> {
  loadOptions: (query?: { query?: string, selectedValue?: string[] }) => Promise<T[]>
  renderOption: (option: T) => React.ReactNode
  getOptionValue: (option: T) => string
  getDisplayValue: (option: T) => React.ReactNode
  // CONTROLS
  onChange?: (value: string | string[]) => void
  value?: string | string[]
  defaultValue?: string | string[]
  // PROPS
  name?: string
  field?: any
  placeholder?: string
  className?: string
  triggerClassName?: string
  notFound?: React.ReactNode
  loadingSkeleton?: React.ReactNode
  // FLAGS
  isForm?: boolean
  multi?: boolean
  clearable?: boolean
  searchable?: boolean
  disabled?: boolean
  selectFirstOption?: boolean
}

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

export function AsyncSelectNew<T>({
  loadOptions,
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

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const cacheRef = useRef<Map<string, T>>(new Map())

  const [cacheTick, setCacheTick] = useState(0)
  const requestIdRef = useRef(0)

  const [menuOptionIds, setMenuOptionIds] = useState<string[]>([])

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounceValue(search, 200)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const [popoverWidth, setPopoverWidth] = useState<number>()

  const setSelectedSafe = useCallback((next: string[] | string) => {
    setSelectedIds(toIdArray(next))
  }, [])

  // LIFECYCLE 1
  useEffect(() => {
    const el = triggerRef.current
    if (!el)
      return
    const ro = new ResizeObserver(() => setPopoverWidth(el.offsetWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // LIFECYCLE 2
  const controlled = value !== undefined
  const normalizedValue = useMemo<string[]>(
    () => toIdArray(controlled ? value : defaultValue),
    [controlled, value, defaultValue],
  )

  useEffect(() => {
    setSelectedIds((prev) => {
      if (prev.length === normalizedValue.length && prev.every((id, index) => id === normalizedValue[index]))
        return prev
      return normalizedValue
    })
  }, [normalizedValue])

  // LIFECYCLE 3

  const mergeIntoCache = useCallback((list: T[]) => {
    if (!list || list.length === 0)
      return
    const map = cacheRef.current
    let changed = false
    for (const opt of list) {
      const id = getOptionValue(opt)
      const prev = map.get(id)
      if (prev !== opt) {
        map.set(id, opt)
        changed = true
      }
    }
    if (changed)
      setCacheTick(t => t + 1)
  }, [getOptionValue])

  const selectId = useCallback((id: string) => {
    const exists = selectedIds.includes(id)
    if (multi) {
      const next = exists ? selectedIds.filter(v => v !== id) : [...selectedIds, id]
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
  }, [multi, clearable, selectedIds, onChange, setSelectedSafe])

  const removeTag = useCallback((id: string) => {
    if (!multi)
      return
    const next = selectedIds.filter(v => v !== id)
    setSelectedSafe(next)
    onChange?.(next)
  }, [multi, selectedIds, onChange])

  // LIFECYCLE 4

  const fetchMenu = useCallback(async (q: string) => {
    const rid = ++requestIdRef.current
    setLoading(true)
    setError(null)
    try {
      const result = await loadOptions({ query: q })
      if (rid !== requestIdRef.current)
        return
      mergeIntoCache(result)
      setMenuOptionIds(result.map(getOptionValue))
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
  }, [loadOptions, mergeIntoCache, getOptionValue])

  useEffect(() => {
    if (!open)
      return
    void fetchMenu(debouncedSearch || '')
  }, [open, debouncedSearch, fetchMenu])

  // LIFECYCLE 5

  useEffect(() => {
    if (selectedIds.length === 0)
      return
    const missing = selectedIds.filter(id => !cacheRef.current.has(id))
    if (missing.length === 0)
      return

    let cancelled = false
    const hydrate = async () => {
      try {
        const res = await loadOptions({ selectedValue: missing })
        if (!cancelled)
          mergeIntoCache(res)
      }
      catch { /* ignore */ }
    }

    void hydrate()

    return () => {
      cancelled = true
    }
  }, [selectedIds, loadOptions, mergeIntoCache])

  // LIFECYCLE 6

  const menuOptions: T[] = useMemo(() => {
    const map = cacheRef.current
    return menuOptionIds.map(id => map.get(id)).filter(isDefined)
  }, [menuOptionIds, cacheTick])

  const selectedOptions: T[] = useMemo(() => {
    const map = cacheRef.current
    return selectedIds.map(id => map.get(id)).filter(isDefined)
  }, [selectedIds, cacheTick])

  // LIFECYCLE 7

  useEffect(() => {
    if (!selectFirstOption)
      return
    if (controlled)
      return
    if (!open)
      return
    if (selectedIds.length > 0)
      return
    if (menuOptionIds.length === 0)
      return
    const firstId = menuOptionIds[0]
    setSelectedSafe([firstId])
    onChange?.(multi ? [firstId] : firstId)
  }, [selectFirstOption, controlled, open, selectedIds.length, menuOptionIds, onChange, multi])

  const triggerButton = (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={open}
      className={cn(
        'w-full max-w-full min-w-0 justify-between min-h-9',
        disabled && 'opacity-50 cursor-not-allowed',
        (multi && selectedOptions.length > 0) && 'h-auto p-1 has-[>svg]:pl-1',
        triggerClassName,
      )}
      disabled={disabled}
      {...field}
      ref={triggerRef}
      type="button"
    >
      {renderSelectedOptions({
        selectedOptions,
        multi,
        getOptionValue,
        getDisplayValue,
        placeholder: placeholder || t('component.asyncSelect.placeholder'),
        onRemove: removeTag,
      })}
      <ChevronDown className="opacity-50" size={10} />
    </Button>
  )

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {isForm ? <FormControl>{triggerButton}</FormControl> : triggerButton}
        </PopoverTrigger>

        {isForm && <FormMessage />}

        <PopoverContent style={{ width: popoverWidth }} className={cn('p-0', className)}>
          <Command shouldFilter={false}>
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

            <CommandList className="w-full">
              {error && <div className="p-4 text-destructive text-center">{error}</div>}
              {loading && menuOptions.length === 0 && (loadingSkeleton || <DefaultLoadingSkeleton />)}
              {!loading && !error && menuOptions.length === 0 && (notFound || <CommandEmpty>{t('component.asyncSelect.noResultsMessage')}</CommandEmpty>)}

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
                      {renderOption ? renderOption(option) : getDisplayValue(option)}
                      <Check className={cn('ml-auto h-3 w-3', isSelected ? 'opacity-100' : 'opacity-0')} />
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
          value={Array.isArray(selectedIds) ? selectedIds.join(',') : ''}
          readOnly
        />
      )}
    </>
  )
}

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

function renderSelectedOptions<T>({
  selectedOptions,
  multi,
  getOptionValue,
  getDisplayValue,
  placeholder,
  onRemove,
}: {
  selectedOptions: T[]
  multi: boolean
  getOptionValue: (opt: T) => string
  getDisplayValue: (opt: T) => React.ReactNode
  placeholder?: React.ReactNode
  onRemove?: (val: string) => void
}) {
  if (selectedOptions.length === 0)
    return <p className="text-muted-foreground">{placeholder}</p>

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
