import type { ProductPopulatedDTO } from '@remnant/shared'
import type { Column } from '@tanstack/react-table'
import { createColumnHelper } from '@tanstack/react-table'
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronsUpDown,
  Minus,
  Plus,
  X,
} from 'lucide-react'
import { useMemo } from 'react'

import { useProductPropertyQuery } from '@/api/hooks'
import { ImageGallery } from '@/components'
import { Badge, Button, Separator } from '@/components/ui'
import { useAuthContext } from '@/contexts'
import { formatDate } from '@/utils/helpers'
import { hasPermission } from '@/utils/helpers/permission'
import { useLocale } from '@/utils/hooks'

import { EditableCell } from './cells'

export type ViewInventoryProductRow = ProductPopulatedDTO & {
  lineQuantity?: number
  receivedQuantity?: number
}

const sortIcons = { asc: ArrowUp, desc: ArrowDown }

const columnHelper = createColumnHelper<ViewInventoryProductRow>()

interface ProductSelectedTableProps {
  handleChange: (options: { productId: string, field: string, value: string | number | string[], isDebounced?: boolean }) => void
  disabled: boolean
}

export function useColumns(
  {
    handleChange,
    disabled,
  }: ProductSelectedTableProps,
) {
  const { t, language } = useLocale()
  const { permissions } = useAuthContext()

  const { productProperties } = useProductPropertyQuery({
    filters: { active: [true], language, showInTable: true },
    pagination: { full: true },
  })

  const isLoading = false

  const columns = useMemo(() => {
    function sortHeader(column: Column<ViewInventoryProductRow, unknown>, label: string) {
      const sorted = column.getIsSorted()
      const Icon = sorted ? sortIcons[sorted] : ChevronsUpDown

      return (
        <Button
          disabled={isLoading || disabled}
          variant="ghost"
          onClick={() => column.toggleSorting()}
          className="my-2 flex items-center gap-2"
        >
          {label}
          <Icon className="w-4 h-4" />
        </Button>
      )
    }

    function productPropertyColumn() {
      return productProperties.map(property =>
        columnHelper.display({
          id: property.id,
          size: 150,
          meta: {
            title: property.names[language] ?? '',
            filterable: true,
            filterType: 'text',
            sortable: true,
          },
          header: ({ column }) => sortHeader(column, property.names[language] ?? ''),
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
                return <Badge variant={productProperty.value ? 'success' : 'destructive'}>{t(`table.yesno.${productProperty.value as boolean}`)}</Badge>
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
              default:
                return null
            }
          },
        }),
      )
    }

    function permissionColumns() {
      if (!hasPermission(permissions, 'product.purchasePrice'))
        return []
      return [
        columnHelper.accessor(
          row => `${row.purchasePrice} ${row.purchaseCurrency.symbols[language]}`,
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
          const images = row.original.images.map(image => ({
            id: image.id,
            src: image.path,
            alt: image.name ?? image.filename,
          }))
          return (<ImageGallery images={images} size={60} />)
        },
      }),
      columnHelper.accessor(
        row => row.names?.[language] || row.names?.en || '',
        {
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
        },
      ),
      columnHelper.accessor(
        row => `${row.price} ${row.currency.symbols[language]}`,
        {
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
        },
      ),
      ...permissionColumns(),
      columnHelper.accessor(
        row => row.unit.names[language],
        {
          id: 'unit',
          size: 150,
          meta: {
            title: t('component.productTable.table.unit'),
            filterable: true,
            filterType: 'text',
            sortable: true,
          },
          header: ({ column }) => sortHeader(column, t('component.productTable.table.unit')),
        },
      ),
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
            {row.original.categories.map(category => <Badge key={category.id}>{category.names[language]}</Badge>)}
          </div>
        ),
      }),
      columnHelper.accessor(
        row => row.productPropertiesGroup.names[language],
        {
          id: 'productPropertyGroup',
          size: 150,
          meta: {
            title: t('component.productTable.table.productPropertyGroup'),
            filterable: true,
            filterType: 'text',
            sortable: true,
          },
          header: ({ column }) => sortHeader(column, t('component.productTable.table.productPropertyGroup')),
        },
      ),
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
        cell: ({ row }) => formatDate(row.getValue('createdAt'), 'dd.MM.yyyy HH:mm', language),
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
        cell: ({ row }) => formatDate(row.getValue('updatedAt'), 'dd.MM.yyyy HH:mm', language),
      }),
      columnHelper.display({
        id: 'selectedQuantity',
        size: 150,
        meta: {
          title: t('component.productTable.table.selectedQuantity'),
          filterable: true,
          filterType: 'number',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('component.productTable.table.selectedQuantity')),
        cell: ({ row }) => {
          const item = row.original

          return (
            <div className="flex gap-2">
              <div className="relative min-w-5">
                <EditableCell
                  product={item}
                  onChange={val => handleChange({
                    productId: item.id,
                    field: 'lineQuantity',
                    value: val,
                    isDebounced: true,
                  })}
                  field="lineQuantity"
                  className="w-20"
                  disabled={true}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <p>{item.unit.symbols[language]}</p>
                </div>
              </div>
            </div>
          )
        },
      }),
      columnHelper.display({
        id: 'receivedQuantity',
        meta: {
          title: t('component.productTable.table.receivedQuantity'),
          filterable: true,
          filterType: 'number',
          sortable: true,
        },
        header: () => t('component.productTable.table.receivedQuantity'),
        cell: ({ row }) => {
          const product = row.original
          const received = product.receivedQuantity ?? 0
          const line = product.lineQuantity ?? 0
          const hasMismatch = received !== line

          return (
            <div className="flex items-center gap-2">
              <Badge variant={hasMismatch ? 'destructive' : 'success'}>
                {hasMismatch ? <X /> : <Check />}
              </Badge>
              <Separator orientation="vertical" className="h-8" />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleChange({ productId: product.id, field: 'receivedQuantity', value: received - 1 })}
                  disabled={isLoading || disabled}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="relative min-w-5">
                  <EditableCell
                    product={product}
                    onChange={value => handleChange({
                      productId: product.id,
                      field: 'receivedQuantity',
                      value,
                      isDebounced: true,
                    })}
                    field="receivedQuantity"
                    className="w-20"
                    disabled={isLoading || disabled}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <p>{product.unit.symbols[language]}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleChange({ productId: product.id, field: 'receivedQuantity', value: received + 1 })}
                  disabled={isLoading || disabled}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        },
      }),
    ]
  }, [disabled, handleChange, isLoading, language, permissions, productProperties, t])

  return columns
}
