import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronsUpDown,
  Minus,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useCurrencyOptions, useCurrencyQuery, useProductPropertyQuery } from '@/api/hooks'
import { ImageGallery } from '@/components'
import { AsyncSelectNew } from '@/components/AsyncSelectNew'
import { Badge, Button, Input, Popover, PopoverContent, PopoverTrigger, Separator } from '@/components/ui'
import { useAuthContext } from '@/contexts'
import { formatDate } from '@/utils/helpers'
import { hasPermission } from '@/utils/helpers/permission'
import { EditableCell } from './cells'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }

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
  const { t, i18n } = useTranslation()
  const { permissions } = useAuthContext()

  const requestProductProperties = useProductPropertyQuery({ filters: { active: [true], language: i18n.language, showInTable: true }, pagination: { full: true } })
  const productProperties = requestProductProperties.data?.data.productProperties || []

  const isLoading = false

  const { data: { currencies = [] } = {} } = useCurrencyQuery(
    {},
    { options: {
      select: response => ({
        currencies: response.data.currencies,
      }),
    } },
  )

  const columns = useMemo(() => {
    function sortHeader(column, label) {
      const Icon = sortIcons[column.getIsSorted() || undefined] || ChevronsUpDown

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

    // function actionColumn() {
    //   return ({
    //     id: 'action',
    //     size: 85,
    //     meta: {
    //       title: t('table.actions'),
    //     },
    //     enableHiding: false,
    //     cell: ({ row }) => {
    //       const item = row.original
    //       return (
    //         <div className="flex gap-2 justify-end">
    //           <Button
    //             onClick={() => removeProduct(item)}
    //             variant="ghost"
    //             size="icon"
    //             className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
    //             disabled={isLoading || disabled}
    //           >
    //             <Trash2 className="h-4 w-4" />
    //           </Button>
    //         </div>
    //       )
    //     },
    //   })
    // }

    function productPropertyColumn() {
      return productProperties.map(property => ({
        id: property.id,
        size: 150,
        meta: {
          title: property.names[i18n.language],
          filterable: true,
          filterType: 'text',
          sortable: true,
        },
        header: ({ column }) => sortHeader(column, property.names[i18n.language]),
        cell: ({ row }) => {
          const productProperty = row.original.productProperties.find(p => p.id === property.id)

          if (!productProperty)
            return null

          switch (productProperty.data.type) {
            case 'text':
              return productProperty.value
            case 'number':
              return productProperty.value
            case 'boolean':
              return <Badge variant={productProperty.value ? 'success' : 'destructive'}>{t(`table.yesno.${productProperty.value}`)}</Badge>
            case 'select':
              return (
                <div className="flex flex-wrap gap-2">
                  {productProperty.optionData.map(option =>
                    <Badge key={option.id}>{option.names[i18n.language]}</Badge>)}
                </div>
              )
            case 'multiSelect':
              return (
                <div className="flex flex-wrap gap-2">
                  {productProperty.optionData.map(option =>
                    <Badge key={option.id}>{option.names[i18n.language]}</Badge>)}
                </div>
              )
            case 'color':
              return (
                <div className="flex flex-wrap gap-2">
                  {productProperty.optionData.map(option => (
                    <Badge key={option.id}>
                      <div className="w-2 h-2 rounded-full border-gray-200" style={{ backgroundColor: option.color }} />
                      {option.names[i18n.language]}
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
          accessorFn: row => `${row.purchasePrice} ${row.purchaseCurrency.symbols[i18n.language]}`,
        },
      ]
    }

    return [
      {
        id: 'images',
        size: 100,
        meta: {
          title: t('component.productTable.table.images'),
          defaultVisible: true,
        },
        cell: ({ row }) => {
          const images = row.original.images.map((image, index) => ({
            id: index,
            src: image.path,
            alt: image.originalname,
          }))
          return (<ImageGallery images={images} size={60} />)
        },
      },
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
        accessorFn: row => row.names?.[i18n.language] || row.names?.en,
      },
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
        accessorFn: row => `${row.price} ${row.currency.symbols[i18n.language]}`,
      },
      ...permissionColumns(),
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
        accessorFn: row => `${row.unit.names[i18n.language]}`,
      },
      {
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
            {row.original.categories.map(category => <Badge key={category.id}>{category.names[i18n.language]}</Badge>)}
          </div>
        ),
      },
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
        accessorFn: row => `${row.productPropertiesGroup.names[i18n.language]}`,
      },
      ...productPropertyColumn(),
      {
        id: 'createdAt',
        accessorKey: 'createdAt',
        meta: {
          title: t('table.createdAt'),
          filterable: true,
          filterType: 'date',
          sortable: true,
        },
        header: ({ column }) => sortHeader(column, t('table.createdAt')),
        cell: ({ row }) => formatDate(row.getValue('createdAt'), 'dd.MM.yyyy HH:mm', i18n.language),
      },
      {
        id: 'updatedAt',
        accessorKey: 'updatedAt',
        meta: {
          title: t('table.updatedAt'),
          filterable: true,
          filterType: 'date',
          sortable: true,
        },
        header: ({ column }) => sortHeader(column, t('table.updatedAt')),
        cell: ({ row }) => formatDate(row.getValue('updatedAt'), 'dd.MM.yyyy HH:mm', i18n.language),
      },
      {
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
                    field: 'quantity',
                    value: val,
                    isDebounced: true,
                  })}
                  field="quantity"
                  className="w-20"
                  disabled={true}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <p>{item.unit.symbols[i18n.language]}</p>
                </div>
              </div>
            </div>
          )
        },
      },
      {
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
          const hasMismatch = product.receivedQuantity !== product.quantity

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
                  onClick={() => handleChange({ productId: product.id, field: 'receivedQuantity', value: product.receivedQuantity - 1 })}
                  disabled={isLoading || disabled}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="relative min-w-5">
                  {/* <Input
                        placeholder={t('component.product-select-table.quantity.placeholder')}
                        value={product.receivedQuantity}
                        className="pr-10 w-20"
                        disabled={isLoading || disabled}
                        onChange={event => handleChange({
                          productId: product.id,
                          field: 'receivedQuantity',
                          value: Number.parseInt(event.target.value),
                          isDebounced: true,
                        })}
                      /> */}
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
                    <p>{product.unit.symbols[i18n.language]}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleChange({ productId: product.id, field: 'receivedQuantity', value: product.receivedQuantity + 1 })}
                  disabled={isLoading || disabled}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        },
      },
    ]
  }, [i18n.language, productProperties, currencies, handleChange, isLoading, disabled])
  return columns
}
