import type { ColumnDef } from '@tanstack/react-table'

import { Button, Input } from '@/components/ui'

import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { zodResolver } from '@hookform/resolvers/zod'

import { Check, Filter, MousePointerClick, Pencil, Plus, X, XCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

interface BatchEditItem {
  id: string
  column: string
  value: string | number | boolean | Record<string, string>
}

interface BatchEditProps {
  isLoading?: boolean
  buttonLabel?: string
  columns: ColumnDef<any>[]
  languages: Language[]
  onSubmit: (data) => void
  onToggle: (status: 'filter' | 'select') => void
}

const batchEditItemSchema = z.object({
  id: z.string(),
  column: z.string(),
  value: z.union([z.string(), z.number(), z.boolean(), z.record(z.string())]),
})

const formSchema = z.object({
  items: z.array(batchEditItemSchema),
})

type FormValues = z.infer<typeof formSchema>
type FormItemType = z.infer<typeof batchEditItemSchema>

interface ColumnMeta {
  title: string
  batchEdit: boolean
  batchEditType: 'textMultiLanguage' | 'number' | 'boolean' | 'text'
}

export function BatchEdit({
  isLoading = false,
  buttonLabel,
  columns,
  languages,
  onSubmit,
  onToggle,
}: BatchEditProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [toggleFilterMode, setToggleFilterMode] = useState<'filter' | 'select'>('select')

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: [],
    },
  })

  const editableColumns = columns
    .filter(column => (column.meta as ColumnMeta)?.batchEdit)
    .map((column) => {
      const items = form.getValues('items')
      const isDisabled = items.some(item => item.column === column.id)

      return {
        id: column.id,
        label: (column.meta as ColumnMeta)?.title || column.id,
        type: (column.meta as ColumnMeta)?.batchEditType,
        disabled: isDisabled,
      }
    })

  const addItem = () => {
    const currentItems = form.getValues('items')
    const newItem: BatchEditItem = {
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

  const handleAccept = (values) => {
    const validItems = values.items.filter(
      item =>
        item.id !== undefined && item.column !== '' && item.value !== '',
    )

    if (validItems.length === 0)
      return
    onSubmit(validItems)
    setIsOpen(false)
  }

  const handleDecline = () => {
    form.reset()
    setIsOpen(false)
  }

  const handleToggleFilterMode = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const status = toggleFilterMode === 'filter' ? 'select' : 'filter'
    setToggleFilterMode(status)
    onToggle(status)
  }

  const renderInput = (item: FormItemType, index: number) => {
    const column = editableColumns.find(col => col.id === item.column)
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
            placeholder={t('component.batchEdit.newValue')}
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
            placeholder={t('component.batchEdit.newValue')}
          />
        )
      case 'boolean':
        return (
          <Select
            value={item.value as string}
            onValueChange={(value) => {
              const currentItems = form.getValues('items')
              currentItems[index].value = value
              form.setValue('items', currentItems)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('component.batchEdit.selectValue')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">{t('component.batchEdit.true')}</SelectItem>
              <SelectItem value="false">{t('component.batchEdit.false')}</SelectItem>
            </SelectContent>
          </Select>
        )
      case 'textMultiLanguage':
        return (
          <div className="space-y-2">
            {languages.map(language => (
              <div key={language.code} className="flex items-center gap-2">
                <Input
                  value={(item.value as Record<string, string>)[language.code] || ''}
                  onChange={(e) => {
                    const currentItems = form.getValues('items')
                    const currentValue = currentItems[index].value as Record<string, string>
                    currentItems[index].value = {
                      ...currentValue,
                      [language.code]: e.target.value,
                    }
                    form.setValue('items', currentItems)
                  }}
                  placeholder={t(`language.${language.code}`)}
                />
              </div>
            ))}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" disabled={isLoading}>
          <Pencil className="mr-2 h-4 w-4" />
          {buttonLabel || t('component.batchEdit.button')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-xl" align="start">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAccept)} className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">{t('component.batchEdit.title')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('component.batchEdit.description')}
              </p>
            </div>

            <div className="space-y-4">
              {form.getValues('items').map((item, index) => (
                <div key={item.id} className="flex gap-2 items-center">
                  <FormField
                    control={form.control}
                    name={`items.${index}.column`}
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          value={field.value}
                          onValueChange={(v) => {
                            field.onChange(v)
                            const items = form.getValues('items')
                            items[index].column = v
                            items[index].value = ''
                            form.setValue('items', items)
                          }}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={t('component.batchEdit.selectColumn')} />
                          </SelectTrigger>
                          <SelectContent>
                            {editableColumns.map(column => (
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
                {t('component.batchEdit.addItem')}
              </Button>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleToggleFilterMode}
                  >
                    {toggleFilterMode === 'filter' ? <Filter /> : <MousePointerClick />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {toggleFilterMode === 'filter' ? t('component.batchEdit.filterMode') : t('component.batchEdit.selectMode')}
                </TooltipContent>
              </Tooltip>
              <Button variant="outline" onClick={handleDecline} type="button">
                <XCircle className="mr-2 h-4 w-4" />
                {t('component.batchEdit.cancel')}
              </Button>
              <Button type="submit" disabled={form.watch('items').length === 0}>
                <Check className="mr-2 h-4 w-4" />
                {t('component.batchEdit.apply')}
              </Button>
            </div>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  )
}
