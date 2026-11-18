import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useState } from 'react'

import { useSiteOptions } from '@/api/hooks'
import { ColumnVisibilityMenu } from '@/components'
import { AsyncSelectNew } from '@/components/AsyncSelectNew'
import {
  Badge,
  Button,
  Checkbox,
  Label,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { useLocale } from '@/utils/hooks'
import { useProductsImportContext } from '../context'
import { useImportPreviewColumns } from './columns'

export function PreviewStep() {
  const { t, language } = useLocale()
  const loadSitesOptions = useSiteOptions()
  const columns = useImportPreviewColumns()
  const [columnVisibility, setColumnVisibility] = useState({})
  const {
    preview,
    isAutoSyncEnabled,
    syncSites,
    isImportLoading,
    setIsAutoSyncEnabled,
    setSyncSites,
    cancelPreview,
    confirmImport,
  } = useProductsImportContext()

  const table = useReactTable({
    data: preview?.rows ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    getRowId: row => String(row.rowIndex),
    state: { columnVisibility },
  })

  if (!preview)
    return null

  const canConfirm = preview.summary.valid > 0

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            {t('page.productsImport.preview.summary.total', { count: preview.summary.total })}
          </Badge>
          <Badge variant="success">
            {t('page.productsImport.preview.summary.valid', { count: preview.summary.valid })}
          </Badge>
          <Badge variant="destructive">
            {t('page.productsImport.preview.summary.invalid', { count: preview.summary.invalid })}
          </Badge>
        </div>
        <ColumnVisibilityMenu table={table} tableId="products-import-preview" />
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded-sm border">
        <table className="w-full caption-bottom text-sm">
          <TableHeader className="sticky top-0 z-10 bg-background shadow-[inset_0_-1px_0_0_var(--border)]">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    className={`max-w-[${header.column.columnDef.size}px] bg-background`}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0
              ? table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    className={row.original.status === 'invalid' ? 'bg-destructive/5' : undefined}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell
                        key={cell.id}
                        className={`max-w-[${cell.column.columnDef.size}px] align-top`}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      {t('table.noResults')}
                    </TableCell>
                  </TableRow>
                )}
          </TableBody>
        </table>
      </div>

      <div className="shrink-0 border-t bg-background pt-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex w-full max-w-xl flex-col gap-3">
            <div className="flex items-center justify-between gap-4 rounded-md border px-4 py-3">
              <div className="space-y-0.5">
                <Label className="text-sm">{t('page.products.form.isAutoSyncEnabled')}</Label>
                <p className="text-xs text-muted-foreground">
                  {t('page.products.form.isAutoSyncEnabled.description')}
                </p>
              </div>
              <Checkbox
                checked={isAutoSyncEnabled}
                onCheckedChange={checked => setIsAutoSyncEnabled(checked === true)}
                disabled={isImportLoading}
              />
            </div>

            {!isAutoSyncEnabled && (
              <div className="space-y-2">
                <Label>{t('page.products.form.syncSites')}</Label>
                <AsyncSelectNew
                  value={syncSites}
                  onChange={value => setSyncSites(Array.isArray(value) ? value : value ? [value] : [])}
                  loadOptions={async ({ query = '', selectedValue } = {}) => loadSitesOptions({ query, selectedValue })}
                  renderOption={e => `${e.names[language]}`}
                  getDisplayValue={e => `${e.names[language]}`}
                  getOptionValue={e => e.id}
                  disabled={isImportLoading}
                  triggerClassName="w-full"
                  searchable
                  clearable
                  multi
                  isForm={false}
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" type="button" onClick={cancelPreview} disabled={isImportLoading}>
              {t('page.productsImport.preview.cancel')}
            </Button>
            <Button type="button" disabled={!canConfirm} loading={isImportLoading} onClick={confirmImport}>
              {t('page.productsImport.preview.confirm')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
