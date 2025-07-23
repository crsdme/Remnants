/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */
import { Check, ChevronDown, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button, Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, FormControl, FormMessage, Popover, PopoverContent, PopoverTrigger } from '@/components/ui'
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
  onChange?: (value: string | string[]) => void
  value?: string[]
  name?: string
  label?: string
  placeholder?: string
  disabled?: boolean
  className?: string
  triggerClassName?: string
  multi?: boolean
  clearable?: boolean
  searchable?: boolean
  field?: any
  notFound?: React.ReactNode
  loadingSkeleton?: React.ReactNode
  selectFirstOption?: boolean
  // noResultsMessage?: string
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
  field,
  loadingSkeleton,
  notFound,
  selectFirstOption = false,
}: AsyncSelectProps<T>) {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { t } = useTranslation()

  const [selectedValues, setSelectedValues] = useState([])
  const [selectedOptions, setSelectedOptions] = useState([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounceValue(search, 200)

  const normalizedValue = useMemo(
    () => Array.isArray(value) ? value : value ? [value] : [],
    [value],
  )

  const triggerRef = useRef<HTMLButtonElement>(null)
  const [popoverWidth, setPopoverWidth] = useState<number>()

  useEffect(() => {
    setMounted(true)

    const el = triggerRef.current
    if (!el)
      return

    const resizeObserver = new ResizeObserver(() => {
      setPopoverWidth(el.offsetWidth)
    })

    resizeObserver.observe(el)

    return () => resizeObserver.disconnect()
  }, [])

  const handleRemoveTag = (id: string) => {
    const updated = selectedValues.filter(v => v !== id)
    const updatedOptions = selectedOptions.filter(o => getOptionValue(o) !== id)
    setSelectedValues(updated)
    setSelectedOptions(updatedOptions)
    onChange?.(updated)
  }

  const handleSelect = useCallback((id: string) => {
    const isAlreadySelected = selectedValues.includes(id)

    if (multi) {
      const nextValues = isAlreadySelected
        ? selectedValues.filter(v => v !== id)
        : [...selectedValues, id]

      const nextOptions = isAlreadySelected
        ? selectedOptions.filter(opt => getOptionValue(opt) !== id)
        : [
            ...selectedOptions,
            options.find(opt => getOptionValue(opt) === id)!,
          ]

      setSelectedValues(nextValues)
      setSelectedOptions(nextOptions)
      onChange?.(nextValues)
      return
    }

    const shouldClear = clearable && isAlreadySelected
    const nextValue = shouldClear ? [] : [id]
    const nextOption = options.find(opt => getOptionValue(opt) === id)

    setSelectedValues(nextValue)
    setSelectedOptions(nextOption ? [nextOption] : [])
    onChange?.(shouldClear ? '' : id)
    setOpen(false)
  }, [
    multi,
    clearable,
    options,
    selectedValues,
    selectedOptions,
    getOptionValue,
    onChange,
  ])

  useEffect(() => { // INITIAL
    if (!mounted)
      return

    const fetchInitialOptions = async () => {
      setLoading(true)
      try {
        const result = await loadOptions({ selectedValue: normalizedValue })
        setOptions(result)

        if (
          selectFirstOption
          && normalizedValue.length === 0
          && result.length > 0
        ) {
          const first = result[0]
          const firstValue = getOptionValue(first)

          setSelectedValues([firstValue])
          setSelectedOptions([first])
          onChange?.(multi ? [firstValue] : firstValue)
          return
        }

        const selected = result.filter(opt => normalizedValue?.includes(getOptionValue(opt)))
        setSelectedOptions(selected)
        setSelectedValues(selected.map(getOptionValue))
      }
      catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch options')
      }
      finally {
        setLoading(false)
      }
    }

    fetchInitialOptions()
  }, [mounted])

  useEffect(() => { // SEARCH
    if (!searchable)
      return

    let isCancelled = false

    const fetchSearch = async () => {
      setLoading(true)
      try {
        const result = await loadOptions({ query: debouncedSearch })
        if (!isCancelled)
          setOptions(result)
      }
      catch (err) {
        if (!isCancelled)
          setError(err instanceof Error ? err.message : 'Failed to fetch options')
      }
      finally {
        if (!isCancelled)
          setLoading(false)
      }
    }

    fetchSearch()

    return () => {
      isCancelled = true
    }
  }, [debouncedSearch, loadOptions])

  useEffect(() => { // CHANGE LOAD OPTIONS
    if (!mounted)
      return

    const fetchOptions = async () => {
      setLoading(true)
      try {
        const result = await loadOptions({ query: '' })
        setOptions(result)
      }
      catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch options')
      }
      finally {
        setLoading(false)
      }
    }

    fetchOptions()
  }, [loadOptions])

  useEffect(() => { // CHANGE FORM VALUE
    if (options.length > 0) {
      setSelectedOptions(options.filter(option =>
        (value || []).includes(getOptionValue(option)),
      ))
      setSelectedValues(value || [])
    }
  }, [options, value, getOptionValue])

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
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
            >
              { renderSelectedOptions({
                selectedOptions,
                multi,
                getOptionValue,
                getDisplayValue,
                placeholder: placeholder || <p className="text-muted-foreground">{t('component.asyncSelect.placeholder')}</p>,
                onRemove: handleRemoveTag,
              }) }
              <ChevronDown className="opacity-50" size={10} />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <FormMessage />
        <PopoverContent style={{ width: popoverWidth }} className={cn('p-0', className)}>
          <Command shouldFilter={false}>
            {searchable && (
              <div className="relative w-full">
                <CommandInput
                  placeholder={t('component.asyncSelect.searchPlaceholder')}
                  value={search}
                  onValueChange={value => setSearch(value)}
                  className="w-full"
                />
                {loading && options.length > 0 && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                )}
              </div>
            )}
            <CommandList className="w-full">
              {error && (
                <div className="p-4 text-destructive text-center">
                  {error}
                </div>
              )}
              {loading && options.length === 0 && (
                loadingSkeleton || <DefaultLoadingSkeleton />
              )}
              {!loading && !error && options.length === 0 && (
                notFound || <CommandEmpty>{t('component.asyncSelect.noResultsMessage')}</CommandEmpty>
              )}
              <CommandGroup>
                {options.map(option => (
                  <CommandItem
                    key={getOptionValue(option)}
                    value={getOptionValue(option)}
                    onSelect={handleSelect}
                  >
                    {renderOption(option)}
                    <Check
                      className={cn(
                        'ml-auto h-3 w-3',
                        selectedOptions.find(item => item.id === option.id) ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <input type="hidden" name={name} value={selectedValues} />
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
    return placeholder

  if (!multi) {
    return (
      <span className="block overflow-hidden text-ellipsis whitespace-nowrap max-w-full">
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
