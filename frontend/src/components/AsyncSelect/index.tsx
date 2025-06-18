/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */
import { Check, ChevronDown, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
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
  /** Async function to fetch options */
  fetcher: (query?: { query?: string, selectedValue?: string[] }) => Promise<T[]>
  /** Preload all data ahead of time */
  preload?: boolean
  /** Function to filter options */
  filterFn?: (option: T, query: string) => boolean
  /** Function to render each option */
  renderOption: (option: T) => React.ReactNode
  /** Function to get the value from an option */
  getOptionValue: (option: T) => string
  /** Function to get the display value for the selected option */
  getDisplayValue: (option: T) => React.ReactNode
  /** Custom not found message */
  notFound?: React.ReactNode
  /** Custom loading skeleton */
  loadingSkeleton?: React.ReactNode
  /** Currently selected value */
  value?: string[]
  /** Callback when selection changes */
  onChange?: (value: string | string[]) => void
  /** Label for the select field */
  label?: string
  /** Placeholder text when no selection */
  placeholder?: string
  /** Disable the entire select */
  disabled?: boolean
  /** Custom width for the popover */
  width?: string | number
  /** Custom class names */
  className?: string
  /** Custom trigger button class names */
  triggerClassName?: string
  /** Custom no results message */
  noResultsMessage?: string
  /** Name of the input field */
  name?: string
  /** Whether the select is multi-select */
  multi?: boolean
  /** Whether the select is clearable */
  clearable?: boolean
  /** Field to bind to */
  field?: any
}

export function AsyncSelect<T>({
  fetcher,
  preload,
  // filterFn,
  renderOption,
  getOptionValue,
  getDisplayValue,
  notFound,
  loadingSkeleton,
  placeholder,
  value,
  name,
  onChange,
  disabled = false,
  width = '200px',
  className,
  triggerClassName,
  noResultsMessage,
  multi = false,
  clearable = true,
  field,
}: AsyncSelectProps<T>) {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { t } = useTranslation()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [popoverWidth, setPopoverWidth] = useState<number>()

  const [selectedValues, setSelectedValues] = useState<string[]>(value || [])
  const [selectedOptions, setSelectedOptions] = useState([])

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounceValue(search, preload ? 0 : 200)

  useLayoutEffect(() => {
    if (triggerRef.current)
      setPopoverWidth(triggerRef.current.offsetWidth)
  }, [])

  useEffect(() => {
    setMounted(true)
    // setSelectedvalue(typeof value === 'string' && value ? [value] : [])
  }, [])

  useEffect(() => {
    const initializeOptions = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetcher({ selectedValue: value })
        setOptions(data)
        setSelectedOptions(data.filter(option => (selectedValues || []).includes(getOptionValue(option))))
      }
      catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch options')
      }
      finally {
        setLoading(false)
      }
    }

    if (!mounted)
      initializeOptions()
  }, [mounted, fetcher, value])

  useEffect(() => {
    let ignore = false
    const fetchOptions = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetcher({ query: debouncedSearch })
        if (!ignore)
          setOptions(data)
      }
      catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch options')
      }
      finally {
        if (!ignore)
          setLoading(false)
      }
    }
    if (mounted)
      fetchOptions()

    return () => {
      ignore = true
    }
  }, [fetcher, debouncedSearch])

  // useEffect(() => {
  //   if (value && options.length > 0) {
  //     const filteredOptions = options.filter(opt => getOptionValue(opt) === value)
  //     if (filteredOptions.length > 0)
  //       setSelectedOptions(filteredOptions)
  //     else
  //       setSelectedOptions([])
  //   }
  // }, [value, options, getOptionValue])

  // useEffect(() => {
  //   const fetchOptions = async () => {
  //     try {
  //       setLoading(true)
  //       setError(null)
  //       const data = await fetcher(debouncedSearch)
  //       setOptions(data)
  //     }
  //     catch (err) {
  //       setError(err instanceof Error ? err.message : 'Failed to fetch options')
  //     }
  //     finally {
  //       setLoading(false)
  //     }
  //   }
  //   fetchOptions()
  //   if (!mounted || !preload) {
  //     fetchOptions()
  //   }
  //   else if (preload) {
  //     setOptions(options.filter(option => filterFn ? filterFn(option, debouncedSearch) : true))
  //   }
  // }, [fetcher, debouncedSearch, mounted, preload, filterFn])

  const handleSelect = useCallback((currentValue: string) => {
    if (multi) {
      const newSelectedValeus = selectedValues.includes(currentValue)
        ? selectedValues.filter(v => v !== currentValue)
        : [...selectedValues, currentValue]

      const newSelectedOptions = selectedOptions.find(item => item.id === currentValue)
        ? selectedOptions.filter(item => item.id !== currentValue)
        : [...selectedOptions, options.find(item => item?.id === currentValue)!]

      setSelectedValues(newSelectedValeus)
      setSelectedOptions(newSelectedOptions)
      setOpen(true)
      onChange?.(newSelectedValeus)
    }
    else {
      const newValues = clearable && selectedValues.includes(currentValue) ? [] : [currentValue]
      setSelectedValues(newValues)
      setSelectedOptions(options.filter(option => newValues.includes(getOptionValue(option))))
      setOpen(false)
      onChange?.(newValues)
    }
  }, [onChange, options, getOptionValue, selectedValues])

  const handleRemoveTag = (val: string) => {
    const nextValues = selectedValues.filter(v => v !== val)
    setSelectedValues(nextValues)
    setSelectedOptions(
      nextValues.map(val => options.find(opt => getOptionValue(opt) === val)).filter(Boolean),
    )
    onChange?.(nextValues)
  }

  const selectedOptionRender = () => {
    if (selectedOptions.length === 0)
      return placeholder ?? <p className="text-muted-foreground">{t('component.asyncSelect.placeholder')}</p>

    if (!multi)
      return getDisplayValue(selectedOptions[0])

    return (
      <div className="flex flex-wrap items-center gap-1">
        {selectedOptions.map(option => (
          <span
            key={option.id}
            className="flex items-center bg-muted rounded px-2 py-1 text-xs gap-1"
          >
            {getDisplayValue(option)}
            <span
              onClick={(e) => {
                e.stopPropagation()
                handleRemoveTag(getOptionValue(option))
              }}
              className="ml-1 cursor-pointer text-muted-foreground hover:text-destructive"
              aria-label="remove"
            >
              ×
            </span>
          </span>
        ))}
      </div>
    )
  }

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
                'justify-between min-h-9',
                disabled && 'opacity-50 cursor-not-allowed',
                (multi && selectedOptions.length > 0) && 'h-auto p-1 has-[>svg]:pl-1',
                triggerClassName,
              )}
              style={{ width }}
              disabled={disabled}
              {...field}
              ref={triggerRef}
            >
              { selectedOptionRender() }
              <ChevronDown className="opacity-50" size={10} />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <FormMessage />
        <PopoverContent style={{ width: popoverWidth }} className={cn('p-0', className)}>
          <Command shouldFilter={false}>
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
                notFound || <CommandEmpty>{noResultsMessage ?? t('component.asyncSelect.noResultsMessage')}</CommandEmpty>
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
