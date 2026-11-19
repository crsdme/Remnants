import type { ProductImportRowPreviewDTO } from '@remnant/shared'
import { createColumnHelper } from '@tanstack/react-table'
import { useMemo } from 'react'

import { Badge } from '@/components/ui'
import { fromMinor } from '@/utils/helpers/money'
import { useLocale } from '@/utils/hooks'

const columnHelper = createColumnHelper<ProductImportRowPreviewDTO>()

function pickName(
  names: Record<string, string | undefined> | undefined,
  language: string,
) {
  if (!names)
    return '—'
  return names[language] || Object.values(names).find(Boolean) || '—'
}

export function useImportPreviewColumns() {
  const { t, language } = useLocale()

  return useMemo(() => [
    columnHelper.accessor(row => row.rowIndex + 1, {
      id: 'row',
      size: 70,
      meta: {
        title: t('page.productsImport.preview.table.row'),
        defaultVisible: true,
      },
      header: t('page.productsImport.preview.table.row'),
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('status', {
      id: 'status',
      size: 120,
      meta: {
        title: t('page.productsImport.preview.table.status'),
        defaultVisible: true,
      },
      header: t('page.productsImport.preview.table.status'),
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'valid' ? 'success' : 'destructive'}>
          {t(`page.productsImport.preview.status.${row.original.status}`)}
        </Badge>
      ),
    }),
    columnHelper.accessor('action', {
      id: 'action',
      size: 110,
      meta: {
        title: t('page.productsImport.preview.table.action'),
        defaultVisible: true,
      },
      header: t('page.productsImport.preview.table.action'),
      cell: ({ row }) => (
        <Badge variant={row.original.action === 'create' ? 'success' : 'secondary'}>
          {t(`page.productsImport.preview.action.${row.original.action}`)}
        </Badge>
      ),
    }),
    columnHelper.accessor(row => pickName(row.names, language), {
      id: 'names',
      size: 200,
      meta: {
        title: t('page.products.table.names'),
        defaultVisible: true,
      },
      header: t('page.products.table.names'),
    }),
    columnHelper.accessor(row => `${fromMinor(row.minorPrice, 2)} ${pickName(row.currencySymbols, language)}`, {
      id: 'price',
      size: 140,
      meta: {
        title: t('page.products.table.price'),
        defaultVisible: true,
      },
      header: t('page.products.table.price'),
    }),
    columnHelper.accessor(row => pickName(row.currencyNames, language), {
      id: 'currency',
      size: 120,
      meta: {
        title: t('page.products.table.currency'),
        defaultVisible: false,
      },
      header: t('page.products.table.currency'),
    }),
    columnHelper.accessor(row => `${fromMinor(row.minorPurchasePrice, 2)} ${pickName(row.purchaseCurrencySymbols, language)}`, {
      id: 'purchasePrice',
      size: 150,
      meta: {
        title: t('page.products.table.purchasePrice'),
        defaultVisible: true,
      },
      header: t('page.products.table.purchasePrice'),
    }),
    columnHelper.accessor(row => pickName(row.purchaseCurrencyNames, language), {
      id: 'purchaseCurrency',
      size: 140,
      meta: {
        title: t('page.products.table.purchaseCurrency'),
        defaultVisible: false,
      },
      header: t('page.products.table.purchaseCurrency'),
    }),
    columnHelper.accessor(row => pickName(row.unitNames, language), {
      id: 'unit',
      size: 120,
      meta: {
        title: t('page.products.table.unit'),
        defaultVisible: true,
      },
      header: t('page.products.table.unit'),
    }),
    columnHelper.display({
      id: 'categories',
      size: 200,
      meta: {
        title: t('page.products.table.categories'),
        defaultVisible: true,
      },
      header: t('page.products.table.categories'),
      cell: ({ row }) => {
        if (row.original.categories.length === 0)
          return '—'
        return (
          <div className="flex flex-wrap gap-1">
            {row.original.categories.map(category => (
              <Badge key={category.id} variant="secondary">
                {pickName(category.names, language)}
              </Badge>
            ))}
          </div>
        )
      },
    }),
    columnHelper.accessor(row => pickName(row.productPropertiesGroupNames, language), {
      id: 'productPropertyGroup',
      size: 160,
      meta: {
        title: t('page.products.table.productPropertyGroup'),
        defaultVisible: false,
      },
      header: t('page.products.table.productPropertyGroup'),
    }),
    columnHelper.display({
      id: 'barcodes',
      size: 180,
      meta: {
        title: t('page.products.table.barcodes'),
        defaultVisible: false,
      },
      header: t('page.products.table.barcodes'),
      cell: ({ row }) => {
        const codes = row.original.barcodes
        if (codes.length === 0 && !row.original.generateBarcode)
          return '—'
        return (
          <div className="flex flex-wrap gap-1">
            {codes.map(code => (
              <Badge key={code} variant="outline">{code}</Badge>
            ))}
            {row.original.generateBarcode && (
              <Badge variant="secondary">{t('page.productsImport.preview.generateBarcode')}</Badge>
            )}
          </div>
        )
      },
    }),
    columnHelper.accessor('id', {
      id: 'id',
      size: 220,
      meta: {
        title: t('page.productsImport.preview.table.id'),
        defaultVisible: false,
      },
      header: t('page.productsImport.preview.table.id'),
      cell: ({ row }) => row.original.id || '—',
    }),
    columnHelper.display({
      id: 'errors',
      size: 280,
      meta: {
        title: t('page.productsImport.preview.table.errors'),
        defaultVisible: true,
      },
      header: t('page.productsImport.preview.table.errors'),
      cell: ({ row }) => {
        if (row.original.errors.length === 0)
          return '—'
        return (
          <div className="flex flex-wrap gap-1">
            {row.original.errors.map(code => (
              <Badge key={code} variant="destructive">
                {t(`page.productsImport.preview.errors.${code}`)}
              </Badge>
            ))}
          </div>
        )
      },
    }),
  ], [language, t])
}
