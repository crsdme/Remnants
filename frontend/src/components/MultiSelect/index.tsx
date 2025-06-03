import { Check, ChevronDown, RefreshCcw, X } from 'lucide-react'

import * as React from 'react'
import { useTranslation } from 'react-i18next'

import { Badge, Button, Separator } from '@/components/ui'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/utils/lib/utils'

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

  const handleSelect = (currentValue: string) => {
    const newSelectedValues = value.includes(currentValue)
      ? value.filter(v => v !== currentValue)
      : [...value, currentValue]

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
          className="justify-between w-full"
          disabled={isLoading}
        >
          {value.length > 0
            ? (
                <div className="flex gap-1">
                  {value.map((val) => {
                    const option = options.find(o => o.value === val)
                    return (
                      <Badge key={val} variant="secondary" className="px-1 py-0.5 text-xs">
                        {option?.label}
                        <X className="size-4 opacity-50" onClick={() => handleSelect(option?.value)} />
                      </Badge>
                    )
                  })}
                </div>
              )
            : (
                <>
                  {activeFiltersLabel || t('component.multiSelect.activeFilters')}
                </>
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
                      value.includes(option.value) ? 'opacity-100' : 'opacity-0',
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
