import type { WarehouseDTO } from '@remnant/shared'
import { ClipboardList, FileText, Package, ShoppingCart } from 'lucide-react'
import { useCallback } from 'react'
import { useFieldArray, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useWarehouseOptions } from '@/api/hooks'
import { ProductSelectedTable } from '@/components'
import { AsyncSelectNew } from '@/components/AsyncSelectNew'
import { formatQuantitiesByUnit } from '@/components/ProductSelectedTableNew/columns'
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Switch,
} from '@/components/ui'
import { useEntityIdsWithCapability, useLocale } from '@/utils/hooks'
import { useWarehouseTransactionContext } from '../context'

const WAREHOUSE_TRANSACTION_RECEIVE_FORM_ID = 'warehouse-transaction-receive-form'

export function WarehouseTransactionForm() {
  const { isLoading, isViewMode, form, submitWarehouseTransactionForm, onError } = useWarehouseTransactionContext()
  const { t, language } = useLocale()
  const navigate = useNavigate()
  const type = useWatch({
    control: form.control,
    name: 'type',
  })
  const products = useWatch({
    control: form.control,
    name: 'products',
  }) || []

  const productsField = useFieldArray({
    control: form.control,
    name: 'products',
  })

  const updateProduct = ({ productId, field, value }: { productId: string, field: string, value: any }) => {
    const selectedProducts = form.getValues('products')
    const index = selectedProducts.findIndex(p => p.id === productId)

    if (index === -1)
      return

    const current = { ...selectedProducts[index] }
    const updated = { ...current, [field]: value }

    if (field === 'receivedQuantity') {
      updated.receivedQuantity = Math.max(0, Number(value) || 0)
    }

    if (field === 'lineQuantity') {
      updated.lineQuantity = value ?? current.lineQuantity
    }

    productsField.update(index, updated)
  }

  const loadWarehouseOptions = useWarehouseOptions()
  const receiveWarehouseIds = useEntityIdsWithCapability('warehouses', 'receive')
  const canChangeInboundWarehouse = type === 'in' && !isViewMode
  const loadReceiveWarehouseOptions = useCallback(
    async (params?: { query?: string, selectedValue?: string[] }) => {
      const data = await loadWarehouseOptions({
        query: params?.query ?? '',
        selectedValue: params?.selectedValue ?? [],
      })
      const excludeId = form.getValues('fromWarehouse')
      const warehouses = data.filter((warehouse: WarehouseDTO) => warehouse.id !== excludeId)
      if (!canChangeInboundWarehouse || receiveWarehouseIds == null)
        return warehouses
      const allowed = new Set(receiveWarehouseIds)
      return warehouses.filter(warehouse => allowed.has(warehouse.id))
    },
    [canChangeInboundWarehouse, form, loadWarehouseOptions, receiveWarehouseIds],
  )

  const orderedCount = products.reduce((sum, item) => sum + (item.lineQuantity ?? 0), 0)

  return (
    <Form {...form}>
      <form
        id={WAREHOUSE_TRANSACTION_RECEIVE_FORM_ID}
        className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px] lg:items-start"
        onSubmit={(e) => { void form.handleSubmit(submitWarehouseTransactionForm, onError)(e) }}
      >
        <div className="min-w-0 space-y-4">
          <div className="space-y-3 rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <Package className="size-5 shrink-0" />
              <p className="text-lg font-bold">{t('page.warehouse-transactions.form.products')}</p>
              <Separator className="flex-1" />
            </div>

            {products.length === 0
              ? (
                  <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center">
                    <ShoppingCart className="size-8 text-muted-foreground/50" />
                    <p className="text-sm font-medium text-muted-foreground">
                      {t('page.warehouse-transactions.form.products-empty')}
                    </p>
                  </div>
                )
              : (
                  <ProductSelectedTable
                    products={products}
                    removeProduct={() => {}}
                    isLoading={isLoading}
                    changeProduct={updateProduct}
                    includeFooterTotal={true}
                    isQuantity={true}
                    isReceiving={true}
                    removable={false}
                    disabled={isViewMode}
                    tableId="selected-products-component-receive"
                  />
                )}
          </div>

          <div className="space-y-3 rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="size-5 shrink-0" />
              <p className="text-lg font-bold">{t('page.warehouse-transactions.form.information')}</p>
              <Separator className="flex-1" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <p>
                        {t('page.warehouse-transactions.form.type')}
                        <span className="text-destructive ml-1">*</span>
                      </p>
                    </FormLabel>
                    <Select
                      onValueChange={(e) => {
                        field.onChange(e)
                        form.setValue('fromWarehouse', '')
                        form.setValue('toWarehouse', '')
                      }}
                      disabled={true}
                      {...field}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t('page.warehouse-transactions.form.type')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="in">
                          {t('page.warehouse-transactions.form.type.in')}
                        </SelectItem>
                        <SelectItem value="out">
                          {t('page.warehouse-transactions.form.type.out')}
                        </SelectItem>
                        <SelectItem value="transfer">
                          {t('page.warehouse-transactions.form.type.transfer')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {['out', 'transfer'].includes(type) && (
                <FormField
                  control={form.control}
                  name="fromWarehouse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <p>
                          {t('page.warehouse-transactions.form.fromWarehouse')}
                          <span className="text-destructive ml-1">*</span>
                        </p>
                      </FormLabel>
                      <FormControl>
                        <AsyncSelectNew
                          {...field}
                          loadOptions={loadWarehouseOptions}
                          renderOption={e => e.names[language]}
                          getDisplayValue={e => e.names[language]}
                          getOptionValue={e => e.id}
                          disabled={true}
                          onChange={(e) => {
                            field.onChange(e)
                            form.setValue('toWarehouse', '')
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {['in', 'transfer'].includes(type) && (
                <FormField
                  control={form.control}
                  name="toWarehouse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <p>
                          {t('page.warehouse-transactions.form.toWarehouse')}
                          <span className="text-destructive ml-1">*</span>
                        </p>
                      </FormLabel>
                      <FormControl>
                        <AsyncSelectNew
                          {...field}
                          loadOptions={loadReceiveWarehouseOptions}
                          renderOption={e => e.names[language]}
                          getDisplayValue={e => e.names[language]}
                          getOptionValue={e => e.id}
                          disabled={!canChangeInboundWarehouse}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {['transfer'].includes(type) && (
                <FormField
                  control={form.control}
                  name="requiresReceiving"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <p>
                          {t('page.warehouse-transactions.form.requiresReceiving')}
                        </p>
                      </FormLabel>
                      <FormControl>
                        <Switch
                          name="requiresReceiving"
                          defaultChecked={true}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={true}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>
                      <p>
                        {t('page.warehouse-transactions.form.comment')}
                      </p>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('page.warehouse-transactions.form.comment')}
                        className="resize-none"
                        disabled={true}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-4">
          <div className="space-y-3 rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <FileText className="size-5 shrink-0" />
              <p className="text-lg font-bold">{t('page.warehouse-transactions.form.total')}</p>
              <Separator className="flex-1" />
            </div>
            <div className="flex items-start justify-between gap-3 text-sm">
              <span className="text-muted-foreground">
                {t('page.warehouse-transactions.form.items-count', { count: orderedCount })}
              </span>
              <span className="tabular-nums text-right">
                {formatQuantitiesByUnit(products as Array<Record<string, unknown>>, 'lineQuantity', language)}
              </span>
            </div>
            <div className="flex items-start justify-between gap-3 text-sm">
              <span className="text-muted-foreground">
                {isViewMode
                  ? t('page.procurements.form.received')
                  : t('page.warehouse-transactions.form.this-receipt')}
              </span>
              <span className="tabular-nums text-right">
                {formatQuantitiesByUnit(products as Array<Record<string, unknown>>, 'receivedQuantity', language)}
              </span>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => void navigate('/warehouse-transactions')}
            disabled={isLoading}
          >
            {t(isViewMode ? 'button.back' : 'button.cancel')}
          </Button>
          {!isViewMode && (
            <Button type="submit" disabled={isLoading} loading={isLoading} className="w-full">
              {t('button.submit')}
            </Button>
          )}
        </aside>
      </form>
    </Form>
  )
}
