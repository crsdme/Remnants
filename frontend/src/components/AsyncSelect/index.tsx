import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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
  fetcher: (query?: string) => Promise<T[]>
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
  value?: string
  /** Callback when selection changes */
  onChange?: (value: string) => void
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
  /** Whether the select is clearable */
  clearable?: boolean
}

export function AsyncSelect<T>({
  fetcher,
  preload,
  filterFn,
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
  clearable = true,
}: AsyncSelectProps<T>) {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { t } = useTranslation()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [popoverWidth, setPopoverWidth] = useState<number>()

  const [selectedValue, setSelectedValue] = useState(value)
  const [selectedOption, setSelectedOption] = useState<T | null>(null)
  const [originalOptions, setOriginalOptions] = useState<T[]>([])

  const [search, setSearch] = useState('')
  const debouncedSearchTerm = useDebounceValue(search, preload ? 0 : 200)

  useLayoutEffect(() => {
    if (triggerRef.current)
      setPopoverWidth(triggerRef.current.offsetWidth)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
    setMounted(true)
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
    setSelectedValue(value)
  }, [value])

  useEffect(() => {
    const initializeOptions = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await fetcher(value)
        setOriginalOptions(data)
        setOptions(data)
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

  // Initialize selectedOption when options are loaded and value exists
  useEffect(() => {
    if (value && options.length > 0) {
      const option = options.find(opt => getOptionValue(opt) === value)
      if (option)
        // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
        setSelectedOption(option)
    }
  }, [value, options, getOptionValue])

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetcher(debouncedSearchTerm)
        setOriginalOptions(data)
        setOptions(data)
      }
      catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch options')
      }
      finally {
        setLoading(false)
      }
    }

    if (!mounted || !preload) {
      fetchOptions()
    }
    else if (preload) {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setOptions(originalOptions.filter(option => filterFn ? filterFn(option, debouncedSearchTerm) : true))
    }
  }, [fetcher, debouncedSearchTerm, mounted, preload, filterFn])

  const handleSelect = useCallback((currentValue: string) => {
    const newValue = clearable && currentValue === selectedValue ? '' : currentValue

    setSelectedValue(newValue)
    setSelectedOption(options.find(option => getOptionValue(option) === newValue) || null)
    onChange?.(newValue)
    setOpen(false)
  }, [onChange, options, getOptionValue])

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'justify-between',
              disabled && 'opacity-50 cursor-not-allowed',
              triggerClassName,
            )}
            style={{ width }}
            disabled={disabled}
            ref={triggerRef}
          >
            {selectedOption
              ? (getDisplayValue(selectedOption))
              : (placeholder ?? t('component.asyncSelect.placeholder'))}
            <ChevronsUpDown className="opacity-50" size={10} />
          </Button>
        </PopoverTrigger>
        <PopoverContent style={{ width: popoverWidth }} className={cn('p-0', className)}>
          <Command shouldFilter={false}>
            <div className="relative border-b w-full">
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
                        selectedValue === getOptionValue(option) ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <input type="hidden" name={name} value={selectedValue} />
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
