import type { ProductPopulatedDTO } from '@remnant/shared'
import type { Column } from '@tanstack/react-table'
import { createColumnHelper } from '@tanstack/react-table'
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Plus,
} from 'lucide-react'
import { useMemo } from 'react'

import { useTranslation } from 'react-i18next'
import { useProductPropertyQuery } from '@/api/hooks'
import { ImageGallery } from '@/components'
import { Badge, Button } from '@/components/ui'
import { useAuthContext } from '@/contexts'
import { formatDate } from '@/utils/helpers'
import { hasPermission } from '@/utils/helpers/permission'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }
const columnHelper = createColumnHelper<ProductPopulatedDTO>()

export function useColumns({ isLoading, addProduct, filters }: { isLoading: boolean, addProduct: (product: ProductPopulatedDTO) => void, filters: any }) {
  const { t, i18n } = useTranslation()
  const language = i18n.language as 'ru' | 'en'
  const { permissions } = useAuthContext()

  const { productProperties } = useProductPropertyQuery({ filters: { active: [true], language: i18n.language, showInTable: true }, pagination: { full: true } })

  const columns = useMemo(() => {
    function sortHeader(column: Column<ProductPopulatedDTO>, label: string) {
      const sorted = column.getIsSorted()
      const Icon = sorted ? sortIcons[sorted] : ChevronsUpDown

      return (
        <Button
          disabled={isLoading}
          variant="ghost"
          onClick={() => column.toggleSorting()}
          className="my-2 flex items-center gap-2"
        >
          {label}
          <Icon className="w-4 h-4" />
        </Button>
      )
    }

    function actionColumn() {
      return columnHelper.display({
        id: 'action',
        size: 85,
        meta: {
          title: t('table.actions'),
        },
        enableHiding: false,
        cell: ({ row }) => {
          return (
            <Button onClick={() => addProduct(row.original)} variant="default" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          )
        },
      })
    }

    function productPropertyColumn() {
      return productProperties.map(property => columnHelper.display({
        id: property.id,
        size: 150,
        meta: {
          title: property.names[language],
          filterable: true,
          filterType: 'text',
          sortable: true,
        },
        header: ({ column }) => sortHeader(column, property.names[language] ?? property.names.en ?? ''),
        cell: ({ row }) => {
          const productProperty = row.original.productProperties.find(p => p.id === property.id)

          if (!productProperty)
            return null

          switch (productProperty.data.type) {
            case 'text':
              return `${productProperty.value as string} ${productProperty?.data?.symbols?.[language] || ''}`
            case 'number':
              return `${productProperty.value as number} ${productProperty?.data?.symbols?.[language] || ''}`
            case 'boolean':
              return <Badge variant={productProperty.value as boolean ? 'success' : 'destructive'}>{t(`table.yesno.${productProperty.value as boolean}`)}</Badge>
            case 'select':
              return (
                <div className="flex flex-wrap gap-2">
                  {productProperty.options.map(option =>
                    <Badge key={option.id}>{option.names[language]}</Badge>)}
                </div>
              )
            case 'multiSelect':
              return (
                <div className="flex flex-wrap gap-2">
                  {productProperty.options.map(option =>
                    <Badge key={option.id}>{option.names[language]}</Badge>)}
                </div>
              )
            case 'color':
              return (
                <div className="flex flex-wrap gap-2">
                  {productProperty.options.map(option => (
                    <Badge key={option.id}>
                      <div className="w-2 h-2 rounded-full border-gray-200" style={{ backgroundColor: option.color }} />
                      {option.names[language]}
                    </Badge>
                  ))}
                </div>
              )
          }
        },
      }))
    }

    function permissionColumns() {
      if (!hasPermission(permissions, 'product.purchasePrice'))
        return []
      return [
        columnHelper.accessor(
          row => `${row.purchasePrice} ${row.purchaseCurrency?.symbols[language] ?? ''}`,
          {
            id: 'purchasePrice',
            size: 150,
            meta: {
              title: t('component.productTable.table.purchasePrice'),
              filterable: true,
              filterType: 'number',
              sortable: true,
            },
            header: ({ column }) => sortHeader(column, t('component.productTable.table.purchasePrice')),
          },
        ),
      ]
    }

    return [
      columnHelper.display({
        id: 'images',
        size: 100,
        meta: {
          title: t('component.productTable.table.images'),
          defaultVisible: true,
        },
        cell: ({ row }) => {
          const images = row.original.images.map((image, index) => ({
            id: index.toString(),
            src: image.path,
            alt: image.name,
          }))
          return (<ImageGallery images={images} size={80} />)
        },
      }),
      columnHelper.accessor(row => row.names?.[language] || row.names?.en, {
        id: 'names',
        size: 150,
        meta: {
          title: t('component.productTable.table.names'),
          filterable: true,
          filterType: 'text',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('component.productTable.table.names')),
      }),
      columnHelper.accessor(row => `${row.price} ${row.currency.symbols[language]}`, {
        id: 'price',
        size: 150,
        meta: {
          title: t('component.productTable.table.price'),
          filterable: true,
          filterType: 'number',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('component.productTable.table.price')),
      }),
      ...permissionColumns(),
      columnHelper.display({
        id: 'quantity',
        size: 150,
        meta: {
          title: t('component.productTable.table.quantity'),
          filterable: true,
          filterType: 'number',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('component.productTable.table.quantity')),
        cell: ({ row }) => {
          const quantity = row.original.warehouseStock.find((q: any) => q.warehouse === '622b4c21-4937-4afe-b9df-d63b250c4555')
          const unit = row.original.unit.symbols[language]

          return quantity ? `${quantity.count} ${unit}` : `0 ${unit}`
        },
      }),
      columnHelper.accessor(row => `${row.unit.names[language]}`, {
        id: 'unit',
        size: 150,
        meta: {
          title: t('component.productTable.table.unit'),
          filterable: true,
          filterType: 'text',
          sortable: true,
        },
        header: ({ column }) => sortHeader(column, t('component.productTable.table.unit')),
      }),
      columnHelper.display({
        id: 'categories',
        size: 150,
        meta: {
          title: t('component.productTable.table.categories'),
          filterable: true,
          filterType: 'text',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('component.productTable.table.categories')),
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            {row.original.categories.map((category: any) => <Badge key={category.id}>{category.names[language]}</Badge>)}
          </div>
        ),
      }),
      columnHelper.accessor(row => `${row.productPropertiesGroup.names[language]}`, {
        id: 'productPropertyGroup',
        size: 150,
        meta: {
          title: t('component.productTable.table.productPropertyGroup'),
          filterable: true,
          filterType: 'text',
          sortable: true,
        },
        header: ({ column }) => sortHeader(column, t('component.productTable.table.productPropertyGroup')),
      }),
      ...productPropertyColumn(),
      columnHelper.accessor('createdAt', {
        id: 'createdAt',
        meta: {
          title: t('table.createdAt'),
          filterable: true,
          filterType: 'date',
          sortable: true,
        },
        header: ({ column }) => sortHeader(column, t('table.createdAt')),
        cell: ({ row }) => formatDate(row.getValue('createdAt'), 'dd.MM.yyyy HH:mm', i18n.language),
      }),
      columnHelper.accessor('updatedAt', {
        id: 'updatedAt',
        meta: {
          title: t('table.updatedAt'),
          filterable: true,
          filterType: 'date',
          sortable: true,
        },
        header: ({ column }) => sortHeader(column, t('table.updatedAt')),
        cell: ({ row }) => formatDate(row.getValue('updatedAt'), 'dd.MM.yyyy HH:mm', i18n.language),
      }),
      actionColumn(),
    ]
  }, [language, productProperties, permissions, t, i18n.language, isLoading, addProduct, filters])
  return columns
}
