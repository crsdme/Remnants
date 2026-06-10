import { Check, ChevronDown, RefreshCcw, X } from 'lucide-react'

import * as React from 'react'
import { useTranslation } from 'react-i18next'

import {
  Badge,
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
} from '@/components/ui'
import { cn } from '@/utils/lib'

interface Option {
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

const EMPTY_SELECTED_VALUES: string[] = []

export function MultiSelect({
  options,
  activeFiltersLabel,
  selectedMutation,
  onChange,
  value,
}: MultiSelectProps) {
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(false)

  const selectedValues = value ?? EMPTY_SELECTED_VALUES

  const handleSelect = (currentValue: string) => {
    const newSelectedValues = selectedValues.includes(currentValue)
      ? selectedValues.filter(v => v !== currentValue)
      : [...selectedValues, currentValue]

    if (onChange) {
      onChange(newSelectedValues)
    }

    if (selectedMutation && selectedMutation.mutate) {
      selectedMutation.mutate({ selectedValues: newSelectedValues })
    }
  }

  const handleReset = () => {
    if (onChange) {
      onChange([])
    }
  }

  const isLoading = selectedMutation?.isLoading || false

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('justify-between w-full min-h-9', selectedValues.length > 0 && 'h-auto p-1 has-[>svg]:pl-1')}
          disabled={isLoading}
        >
          {selectedValues.length > 0
            ? (
                <div className="flex gap-1 flex-wrap">
                  {selectedValues.map((val) => {
                    const option = options.find(o => o.value === val)
                    return (
                      <Badge key={val} variant="secondary" className="px-1 py-0.5 text-xs">
                        {option?.label}
                        <X
                          className="size-4 opacity-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelect(val)
                          }}
                        />
                      </Badge>
                    )
                  })}
                </div>
              )
            : (
                <p className="text-muted-foreground">
                  {activeFiltersLabel || t('component.multiSelect.activeFilters')}
                </p>
              )}
          <ChevronDown className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="end">
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
                {t('component.multiSelect.reset')}
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
