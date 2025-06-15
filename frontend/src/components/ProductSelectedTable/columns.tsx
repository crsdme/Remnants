import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Minus,
  Plus,
  Trash2,
} from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useRequestProductProperties } from '@/api/hooks/product-properties/useRequestProductProperties'
import { ImageGallery } from '@/components'
import { Badge, Button, Input } from '@/components/ui'
import { useAuthContext } from '@/contexts'
import { formatDate } from '@/utils/helpers'
import { hasPermission } from '@/utils/helpers/permission'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }

export function useColumns({ removeProduct }: { removeProduct: (product: any) => void }) {
  const { t, i18n } = useTranslation()
  const { permissions } = useAuthContext()

  const requestProductProperties = useRequestProductProperties({ filters: { active: [true], language: i18n.language, showInTable: true }, pagination: { full: true } })
  const productProperties = requestProductProperties.data?.data.productProperties || []

  const isLoading = false

  const columns = useMemo(() => {
    function sortHeader(column, label) {
      const Icon = sortIcons[column.getIsSorted() || undefined] || ChevronsUpDown

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

    // function selectColumn() {
    //   return ({
    //     id: 'select',
    //     size: 35,
    //     meta: { title: t('component.columnMenu.columns.select') },
    //     header: ({ table }) => {
    //       const isChecked = table.getIsAllPageRowsSelected()
    //         ? true
    //         : table.getIsSomePageRowsSelected()
    //           ? 'indeterminate'
    //           : false

    //       return (
    //         <Checkbox
    //           checked={isChecked}
    //           onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
    //           aria-label="Select all"
    //         />
    //       )
    //     },
    //     cell: ({ row }) => (
    //       <Checkbox
    //         checked={row.getIsSelected()}
    //         onCheckedChange={value => row.toggleSelected(!!value)}
    //         aria-label="Select row"
    //       />
    //     ),
    //     enableSorting: false,
    //     enableHiding: false,
    //   })
    // }

    // function expanderColumn() {
    //   return ({
    //     id: 'expander',
    //     header: '',
    //     cell: ({ row }) => {
    //       if (row.getCanExpand()) {
    //         return (
    //           <Button
    //             variant="ghost"
    //             size="icon"
    //             onClick={row.getToggleExpandedHandler()}
    //             style={{ width: 24, height: 24, padding: 0 }}
    //           >
    //             {row.getIsExpanded()
    //               ? <ChevronDown size={16} />
    //               : <ChevronRight size={16} />}
    //           </Button>
    //         )
    //       }
    //       return null
    //     },
    //     size: 24,
    //     enableSorting: false,
    //     enableHiding: false,
    //   })
    // }

    function actionColumn() {
      return ({
        id: 'action',
        size: 85,
        meta: {
          title: t('table.actions'),
        },
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original

          return (
            <div className="flex gap-2 justify-end">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const newQuantity = item.selectedQuantity - 1
                    row.original.selectedQuantity = newQuantity
                  }}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="relative min-w-5">
                  <Input
                    placeholder={t('component.product-select-table.quantity.placeholder')}
                    value={item.selectedQuantity}
                    className="pr-10 w-20"
                    onChange={event => row.original.selectedQuantity = Number.parseInt(event.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <p>{item.unit.symbols[i18n.language]}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const newQuantity = item.selectedQuantity + 1
                    row.original.selectedQuantity = newQuantity
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                onClick={() => removeProduct(item)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )
        },
      })
    }

    function productPropertyColumn() {
      return productProperties.map(property => ({
        id: property.id,
        size: 150,
        meta: {
          title: property.names[i18n.language],
          batchEdit: true,
          batchEditType: 'textMultiLanguage',
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
            batchEdit: true,
            batchEditType: 'number',
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
      // selectColumn(),
      // expanderColumn(),
      {
        id: 'images',
        size: 100,
        meta: {
          title: t('component.productTable.table.images'),
        },
        cell: ({ row }) => {
          const images = row.original.images.map((image, index) => ({
            id: index,
            src: image.path,
            alt: image.originalname,
          }))
          return (<ImageGallery images={images} />)
        },
      },
      {
        id: 'names',
        size: 150,
        meta: {
          title: t('component.productTable.table.names'),
          batchEdit: true,
          batchEditType: 'textMultiLanguage',
          filterable: true,
          filterType: 'text',
          sortable: true,
        },
        header: ({ column }) => sortHeader(column, t('component.productTable.table.names')),
        accessorFn: row => row.names?.[i18n.language] || row.names?.en,
      },
      {
        id: 'price',
        size: 150,
        meta: {
          title: t('component.productTable.table.price'),
          batchEdit: true,
          batchEditType: 'number',
          filterable: true,
          filterType: 'number',
          sortable: true,
        },
        header: ({ column }) => sortHeader(column, t('component.productTable.table.price')),
        accessorFn: row => `${row.price} ${row.currency.symbols[i18n.language]}`,
      },
      ...permissionColumns(),
      // {
      //   id: 'quantity',
      //   size: 150,
      //   meta: {
      //     title: t('component.productTable.table.quantity'),
      //     batchEdit: true,
      //     batchEditType: 'number',
      //     filterable: true,
      //     filterType: 'number',
      //     sortable: true,
      //   },
      //   header: ({ column }) => sortHeader(column, t('component.productTable.table.quantity')),
      //   cell: ({ row }) => {
      //     const quantity = row.original.quantity.find(q => q.warehouse === '622b4c21-4937-4afe-b9df-d63b250c4555')
      //     const unit = row.original.unit.symbols[i18n.language]

      //     return quantity ? `${quantity.count} ${unit}` : `0 ${unit}`
      //   },
      // },
      {
        id: 'selectedQuantity',
        size: 150,
        meta: {
          title: t('component.productTable.table.selectedQuantity'),
          batchEdit: true,
          batchEditType: 'number',
          filterable: true,
          filterType: 'number',
          sortable: true,
        },
        header: ({ column }) => sortHeader(column, t('component.productTable.table.selectedQuantity')),
        cell: ({ row }) => {
          const selectedQuantity = row.original.selectedQuantity
          const unit = row.original.unit.symbols[i18n.language]

          return `${selectedQuantity || 0} ${unit}`
        },
      },
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
        cell: ({ row }) => formatDate(row.getValue('createdAt'), 'MMMM dd, yyyy', i18n.language),
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
        cell: ({ row }) => formatDate(row.getValue('updatedAt'), 'MMMM dd, yyyy', i18n.language),
      },
      actionColumn(),
    ]
  }, [i18n.language, productProperties])
  return columns
}
