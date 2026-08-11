import type { InventoryItemViewFilter } from '@remnant/shared'
import { ClipboardList, Package } from 'lucide-react'
import { useState } from 'react'
import { useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useCategoryOptions, useWarehouseOptions } from '@/api/hooks'
import { AsyncSelectNew } from '@/components/AsyncSelectNew'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Separator,
  Textarea,
} from '@/components/ui'
import { useBarcodeScanned, useLocale } from '@/utils/hooks'
import { cn } from '@/utils/lib/utils'
import { useCreateInventoryContext } from '../context'
import { CountingTable } from './CountingTable'

const VIEW_FILTERS: InventoryItemViewFilter[] = ['all', 'uncounted', 'counted', 'mismatch']

export function CreateInventoryForm() {
  const { t, language } = useLocale()
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const {
    form,
    isLoading,
    isSaving,
    isDraftReady,
    inventoryItems,
    inventoryItemsCount,
    progress,
    viewFilter,
    setViewFilter,
    search,
    setSearch,
    pagination,
    setPagination,
    focusedProductId,
    startInventory,
    saveComment,
    saveItemQuantity,
    handleBarcodeScan,
    submitInventoryForm,
    onError,
    isItemsLoading,
  } = useCreateInventoryContext()

  const selectedCategories = useWatch({
    control: form.control,
    name: 'categories',
  })

  const selectedWarehouse = useWatch({
    control: form.control,
    name: 'warehouse',
  })

  const canStart = selectedCategories.length > 0 && !!selectedWarehouse
  const scopeLocked = isDraftReady
  const loadWarehouseOptions = useWarehouseOptions()
  const loadCategoryOptions = useCategoryOptions()

  useBarcodeScanned(async (barcode: string) => {
    if (!isDraftReady)
      return
    await handleBarcodeScan(barcode)
  })

  const countedPercent = progress && progress.total > 0
    ? Math.round((progress.counted / progress.total) * 100)
    : 0

  const filterCount = (view: InventoryItemViewFilter) => {
    if (!progress)
      return ''
    if (view === 'all')
      return ` (${progress.total})`
    if (view === 'uncounted')
      return ` (${progress.uncounted})`
    if (view === 'counted')
      return ` (${progress.counted})`
    return ` (${progress.mismatches})`
  }

  return (
    <Form {...form}>
      <form
        className="w-full space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (!isDraftReady)
            return
          void form.handleSubmit(() => setConfirmOpen(true), onError)(e)
        }}
      >
        <div className="space-y-3 rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="size-5 shrink-0" />
            <p className="text-lg font-bold">{t('page.create-inventory.information-form.title')}</p>
            <Separator className="flex-1" />
            {isDraftReady && (
              <p className="text-sm text-muted-foreground">
                {isSaving
                  ? t('page.create-inventory.autosave.saving')
                  : t('page.create-inventory.autosave.saved')}
              </p>
            )}
          </div>

          <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
            <FormField
              control={form.control}
              name="warehouse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <p>
                      {t('page.create-inventory.form.warehouse')}
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
                      disabled={isLoading || scopeLocked}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <p>
                      {t('page.create-inventory.form.categories')}
                      <span className="text-destructive ml-1">*</span>
                    </p>
                  </FormLabel>
                  <FormControl>
                    <AsyncSelectNew
                      {...field}
                      multi
                      onChange={(value) => {
                        if (scopeLocked)
                          return
                        field.onChange(value)
                      }}
                      loadOptions={loadCategoryOptions}
                      renderOption={e => e.names[language]}
                      getDisplayValue={e => e.names[language]}
                      getOptionValue={e => e.id}
                      disabled={isLoading || scopeLocked}
                      searchable
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('page.create-inventory.form.comment')}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={t('page.create-inventory.form.comment')}
                    className="w-full"
                    disabled={isLoading}
                    onBlur={() => {
                      field.onBlur()
                      if (isDraftReady)
                        saveComment(field.value ?? '')
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3 rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2">
            <Package className="size-5 shrink-0" />
            <p className="text-lg font-bold">{t('page.create-inventory.form.products')}</p>
            <Separator className="flex-1" />
          </div>

          {!isDraftReady
            ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  {t('page.create-inventory.form.selectScope')}
                </p>
              )
            : (
                <>
                  {progress && (
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                        <p>
                          {t('page.create-inventory.progress.label', {
                            counted: progress.counted,
                            total: progress.total,
                          })}
                        </p>
                        <p className="text-muted-foreground">
                          {t('page.create-inventory.progress.mismatches', { count: progress.mismatches })}
                        </p>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${countedPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2">
                      {VIEW_FILTERS.map(view => (
                        <Button
                          key={view}
                          type="button"
                          size="sm"
                          variant={viewFilter === view ? 'default' : 'outline'}
                          className={cn(viewFilter === view && 'pointer-events-none')}
                          onClick={() => setViewFilter(view)}
                        >
                          {t(`page.create-inventory.filter.${view}`)}
                          {filterCount(view)}
                        </Button>
                      ))}
                    </div>
                    <Input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder={t('page.create-inventory.search.placeholder')}
                      className="sm:max-w-xs"
                    />
                  </div>

                  <CountingTable
                    items={inventoryItems}
                    itemsCount={inventoryItemsCount}
                    isLoading={isItemsLoading}
                    focusedProductId={focusedProductId}
                    pagination={pagination}
                    changePagination={setPagination}
                    onQuantityChange={saveItemQuantity}
                  />
                </>
              )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => void navigate('/inventories')}
            disabled={isLoading}
          >
            {t('button.cancel')}
          </Button>
          {!isDraftReady
            ? (
                <Button
                  type="button"
                  disabled={isLoading || !canStart}
                  loading={isLoading}
                  onClick={() => {
                    void form.handleSubmit(() => startInventory(), onError)()
                  }}
                >
                  {t('page.create-inventory.button.start')}
                </Button>
              )
            : (
                <Button type="submit" disabled={isLoading} loading={isLoading}>
                  {t('button.submit')}
                </Button>
              )}
        </div>
      </form>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('page.create-inventory.confirm.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('page.create-inventory.confirm.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              {t('button.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isLoading}
              onClick={(event) => {
                event.preventDefault()
                setConfirmOpen(false)
                submitInventoryForm()
              }}
            >
              {t('page.create-inventory.confirm.action')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  )
}
