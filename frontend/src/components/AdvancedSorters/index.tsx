import type { ColumnDef } from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Plus, SortAsc, X, XCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

interface SortItem {
  id: string
  column: string
  value: string
}

interface AdvancedSortersProps {
  columns: ColumnDef<any>[]
  onSubmit: (sorters: SortItem[]) => void
  onCancel: () => void
}

interface ColumnMeta {
  title: string
  sortable: boolean
}

const sorterItemSchema = z.object({
  id: z.string(),
  column: z.string().min(1, 'Column is required'),
  value: z.string(),
})

const formSchema = z.object({
  items: z.array(sorterItemSchema),
})

type FormValues = z.infer<typeof formSchema>
type FormItemType = z.infer<typeof sorterItemSchema>

export function AdvancedSorters({ columns, onSubmit, onCancel }: AdvancedSortersProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: [],
    },
  })

  const sortableColumns = columns
    .filter(column => (column.meta as ColumnMeta)?.sortable)
    .map((column) => {
      const items = form.getValues('items')
      const isDisabled = items.some(item => item.column === column.id)

      return {
        id: column.id,
        label: (column.meta as ColumnMeta)?.title || column.id,
        disabled: isDisabled,
      }
    })

  const addItem = () => {
    const currentItems = form.getValues('items')
    const newItem: SortItem = {
      id: Math.random().toString(36).substr(2, 9),
      column: '',
      value: 'asc',
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
        item.column !== '' && item.value !== '',
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
    const column = sortableColumns.find(col => col.id === item.column)
    if (!column)
      return null

    return (
      <Select
        value={item.value}
        onValueChange={(value) => {
          const currentItems = form.getValues('items')
          currentItems[index].value = value
          form.setValue('items', currentItems)
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t('component.advancedSorters.selectColumn')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">{t('component.advancedSorters.asc')}</SelectItem>
          <SelectItem value="desc">{t('component.advancedSorters.desc')}</SelectItem>
        </SelectContent>
      </Select>
    )
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
          <SortAsc className="mr-2 h-4 w-4" />
          {t('component.advancedSorters.button')}
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
              <h4 className="font-medium leading-none">{t('component.advancedSorters.title')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('component.advancedSorters.description')}
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
                              placeholder={t('component.advancedSorters.selectColumn')}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {sortableColumns.map(column => (
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
                {t('component.advancedSorters.addSorter')}
              </Button>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={handleClear} type="button">
                <XCircle className="mr-2 h-4 w-4" />
                {t('component.advancedSorters.clear')}
              </Button>
              <Button type="submit" disabled={form.watch('items').length === 0}>
                <Check className="mr-2 h-4 w-4" />
                {t('component.advancedSorters.apply')}
              </Button>
            </div>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  )
}
