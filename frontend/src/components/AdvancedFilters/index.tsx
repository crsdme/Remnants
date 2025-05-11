import type { ColumnDef } from '@tanstack/react-table'

import type { DateRange } from 'react-day-picker'

import { DateRangePicker } from '@/components/DateRangePicker'
import { MultiSelect } from '@/components/MultiSelect'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Filter, Plus, X, XCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

interface FilterItem {
  id: string
  column: string
  value: string | number | boolean | DateRange | string[]
}

interface AdvancedFiltersProps {
  columns: ColumnDef<any>[]
  onSubmit: (filters: FilterItem[]) => void
  onCancel: () => void
}

interface ColumnMeta {
  title: string
  filterable: boolean
  filterType: 'text' | 'number' | 'boolean' | 'date'
}

const filterItemSchema = z.object({
  id: z.string(),
  column: z.string(),
  value: z.union([z.string(), z.number(), z.boolean(), z.object({ from: z.date(), to: z.date() }), z.array(z.string())]),
})

const formSchema = z.object({
  items: z.array(filterItemSchema),
})

type FormValues = z.infer<typeof formSchema>
type FormItemType = z.infer<typeof filterItemSchema>

export function AdvancedFilters({ columns, onSubmit, onCancel }: AdvancedFiltersProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: [],
    },
  })

  const filterableColumns = columns
    .filter(column => (column.meta as ColumnMeta)?.filterable)
    .map((column) => {
      const items = form.getValues('items')
      const isDisabled = items.some(item => item.column === column.id)

      return {
        id: column.id,
        label: (column.meta as ColumnMeta)?.title || column.id,
        type: (column.meta as ColumnMeta)?.filterType,
        disabled: isDisabled,
      }
    })

  const addItem = () => {
    const currentItems = form.getValues('items')
    const newItem: FilterItem = {
      id: Math.random().toString(36).substr(2, 9),
      column: '',
      value: '',
    }
    form.setValue('items', [...currentItems, newItem])
  }

  const removeItem = (index: number) => {
    const currentItems = form.getValues('items')
    form.setValue(
      'items',
      currentItems.filter((_, i) => i !== index),
    )
  }

  const handleSubmit = (values) => {
    const validItems = values.items.filter(
      item =>
        item.id !== undefined && item.column !== '' && item.value !== '',
    )
    if (validItems.length === 0)
      return
    onSubmit(validItems)
    setIsOpen(false)
  }

  const handleClear = () => {
    form.reset()
    onCancel()
    setIsOpen(false)
  }

  const renderInput = (item: FormItemType, index: number) => {
    const column = filterableColumns.find(col => col.id === item.column)
    if (!column)
      return null

    switch (column.type) {
      case 'text':
        return (
          <Input
            value={item.value as string}
            onChange={(e) => {
              const currentItems = form.getValues('items')
              currentItems[index].value = e.target.value
              form.setValue('items', currentItems)
            }}
            placeholder={t('component.advancedFilters.valuePlaceholder')}
          />
        )
      case 'number':
        return (
          <Input
            type="number"
            value={item.value as number}
            onChange={(e) => {
              const currentItems = form.getValues('items')
              currentItems[index].value = Number(e.target.value)
              form.setValue('items', currentItems)
            }}
            placeholder={t('component.advancedFilters.valuePlaceholder')}
          />
        )
      case 'boolean':
        return (
          <MultiSelect
            value={item.value as string[]}
            onChange={(value) => {
              const currentItems = form.getValues('items')
              currentItems[index].value = value
              form.setValue('items', currentItems)
            }}
            options={[{ label: t('component.advancedFilters.true'), value: 'true' }, { label: t('component.advancedFilters.false'), value: 'false' }]}
          />
        )
      case 'date':
        return (
          <DateRangePicker
            value={item.value as DateRange}
            onSelect={(selectedValues) => {
              const currentItems = form.getValues('items')
              currentItems[index].value = selectedValues
              form.setValue('items', currentItems)
            }}
            className="w-full"
          />
        )
      default:
        return null
    }
  }

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)

        if (!open) {
          handleSubmit(form.getValues())
        }

        if (form.getValues('items').length === 0) {
          onCancel()
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          {t('component.advancedFilters.button')}
          {form.watch('items').length > 0 && (
            <Badge variant="outline" className="ml-2">
              {form.watch('items').length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[520px]" align="start">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">{t('component.advancedFilters.title')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('component.advancedFilters.description')}
              </p>
            </div>

            <div className="space-y-4">
              {form.watch('items').map((item, index) => (
                <div key={item.id} className="flex gap-2 items-center">
                  <FormField
                    control={form.control}
                    name={`items.${index}.column`}
                    render={({ field }) => (
                      <FormItem>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue
                              placeholder={t('component.advancedFilters.selectColumn')}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {filterableColumns.map(column => (
                              <SelectItem
                                key={column.id}
                                value={column.id}
                                disabled={column.disabled}
                              >
                                {column.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex-1">{renderInput(item, index)}</div>

                  <Button variant="outline" size="icon" onClick={() => removeItem(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button variant="outline" className="w-full" onClick={addItem} type="button">
                <Plus className="mr-2 h-4 w-4" />
                {t('component.advancedFilters.addFilter')}
              </Button>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={handleClear} type="button">
                <XCircle className="mr-2 h-4 w-4" />
                {t('component.advancedFilters.clear')}
              </Button>
              <Button type="submit" disabled={form.watch('items').length === 0}>
                <Check className="mr-2 h-4 w-4" />
                {t('component.advancedFilters.apply')}
              </Button>
            </div>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  )
}
