'use client'

import { cn } from '@/utils/lib/utils'

import { Badge, Button, Separator } from '@/view/components/ui'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/view/components/ui/command'

import { Popover, PopoverContent, PopoverTrigger } from '@/view/components/ui/popover'
import { Check, List, RefreshCcw } from 'lucide-react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'

export interface Option {
  value: string
  label: string
}

interface MultiSelectProps {
  options: Option[]
  activeFiltersLabel?: string
  selectedMutation?: {
    mutate: (params: unknown) => void
    isLoading?: boolean
  }
  onChange?: (selectedValues: string[]) => void
  value?: string[]
}

export function MultiSelect({
  options,
  activeFiltersLabel,
  selectedMutation,
  onChange,
  value,
}: MultiSelectProps) {
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(false)
  const [selectedValues, setSelectedValues] = React.useState<string[]>(value || [])

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValues(value)
    }
  }, [value])

  const handleSelect = (currentValue: string) => {
    const newSelectedValues = selectedValues.includes(currentValue)
      ? selectedValues.filter(value => value !== currentValue)
      : [...selectedValues, currentValue]

    setSelectedValues(newSelectedValues)

    if (onChange) {
      onChange(newSelectedValues)
    }

    if (selectedMutation && selectedMutation.mutate) {
      selectedMutation.mutate({ selectedValues: newSelectedValues })
    }
  }

  const handleReset = () => {
    setSelectedValues([])
    if (onChange) {
      onChange([])
    }
  }

  const isLoading = selectedMutation?.isLoading || false

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
            disabled={isLoading}
          >
            <div className="flex items-center">
              <List className="h-4 w-4 mr-2" />
              {activeFiltersLabel || t('component.multiSelect.activeFilters')}
            </div>
            {selectedValues.length > 0 && (
              <>
                <Separator orientation="vertical" className="h-4 w-4" />
                <div className="flex gap-1">
                  {selectedValues.length > 2
                    ? (
                        <Badge variant="secondary" className="px-1 py-0.5 text-xs">
                          {t('component.multiSelect.selected', { count: selectedValues.length })}
                        </Badge>
                      )
                    : (
                        selectedValues.map((value) => {
                          const option = options.find(o => o.value === value)
                          return (
                            <Badge key={value} variant="secondary" className="px-1 py-0.5 text-xs">
                              {option?.label}
                            </Badge>
                          )
                        })
                      )}
                </div>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="end">
          <Command>
            <CommandInput placeholder={t('component.multiSelect.searchPlaceholder')} />
            <CommandList>
              <CommandEmpty>{t('component.multiSelect.noResults')}</CommandEmpty>
              <CommandGroup>
                {options.map(option => (
                  <CommandItem key={option.value} value={option.value} onSelect={handleSelect}>
                    {option.label}
                    <Check
                      className={cn(
                        'ml-auto',
                        selectedValues.includes(option.value) ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
              <Separator />
              <CommandGroup>
                <CommandItem key="reset" value="reset" onSelect={handleReset}>
                  <RefreshCcw />
                  {' '}
                  {t('component.multiSelect.reset')}
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
