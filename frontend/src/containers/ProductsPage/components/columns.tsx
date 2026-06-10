import type { ProductPopulatedDTO } from '@remnant/shared'
import type { Column } from '@tanstack/react-table'
import { createColumnHelper } from '@tanstack/react-table'
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Copy,
  History,
  PackageIcon,
  Pencil,
  Trash,
} from 'lucide-react'
import { useMemo } from 'react'

import { Link } from 'react-router-dom'
import { useProductPropertyQuery } from '@/api/hooks/product-property/useProductPropertyQuery'
import { ImageGallery, TableActionDropdown } from '@/components'
import { Badge, Button, Checkbox } from '@/components/ui'
import { useAuthContext } from '@/contexts'
import { backendUrl } from '@/utils/constants'
import { formatDate } from '@/utils/helpers'
import { hasPermission } from '@/utils/helpers/permission'
import { useLocale } from '@/utils/hooks'
import { useProductContext } from '../context'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }

const columnHelper = createColumnHelper<ProductPopulatedDTO>()

export function useColumns({ filters }: { filters: { selectedWarehouse: string } }) {
  const { t, language } = useLocale()
  const {
    isLoading,
    openModal,
    openLogsModal,
    removeProduct,
  } = useProductContext()
  const { permissions } = useAuthContext()

  const { productProperties } = useProductPropertyQuery(
    { filters: { active: [true], language, showInTable: true }, pagination: { full: true } },
  )

  const columns = useMemo(() => {
    function sortHeader(column: Column<ProductPopulatedDTO, unknown>, label: string) {
      const sorted = column.getIsSorted()
      const Icon = sorted ? sortIcons[sorted] : ChevronsUpDown

      return (
        <Button
          disabled={isLoading}
          loading={isLoading}
          variant="ghost"
          onClick={() => column.toggleSorting()}
          className="my-2 flex items-center gap-2"
        >
          {label}
          <Icon className="w-4 h-4" />
        </Button>
      )
    }

    function selectColumn() {
      return columnHelper.display({
        id: 'select',
        size: 35,
        meta: { title: t('component.columnMenu.columns.select') },
        header: ({ table }) => {
          const isChecked = table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
              ? 'indeterminate'
              : false

          return (
            <Checkbox
              checked={isChecked}
              onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
            />
          )
        },
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={value => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      })
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
          const item = row.original

          const actions = [
            {
              permission: 'product.edit',
              onClick: () => openModal(item as any),
              label: t('table.edit'),
              icon: <Pencil className="h-4 w-4" />,
            },
            {
              permission: 'product.copy',
              onClick: async () => navigator.clipboard.writeText(item.id),
              label: t('table.copy'),
              icon: <Copy className="h-4 w-4" />,
            },
            {
              permission: 'product.quantity-logs',
              onClick: () => openLogsModal('quantity', item.id),
              label: t('table.quantityLogs'),
              icon: <PackageIcon className="h-4 w-4" />,
            },
            {
              permission: 'product.audit-logs',
              onClick: () => openLogsModal('audit', item.id),
              label: t('table.auditLogs'),
              icon: <History className="h-4 w-4" />,
            },
            {
              permission: 'product.delete',
              onClick: () => removeProduct({ ids: [item.id] }),
              label: t('table.delete'),
              icon: <Trash className="h-4 w-4" />,
              isDestructive: true,
              isConfirm: true,
            },
          ]

          return <TableActionDropdown actions={actions} />
        },
      })
    }

    function productPropertyColumns() {
      return productProperties.map(property =>
        columnHelper.display({
          id: `productProperties.${property.id}`,
          size: 150,
          meta: {
            title: property.names[language],
            filterable: false,
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
              case 'number':
                return `${String(productProperty.value)} ${productProperty?.data?.symbols?.[language] || ''}`
              case 'boolean':
                return <Badge variant={productProperty.value ? 'success' : 'destructive'}>{t(`table.yesno.${String(productProperty.value)}`)}</Badge>
              case 'select':
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
        columnHelper.accessor(row => `${row.purchasePrice} ${row.purchaseCurrency.symbols[language] ?? ''}`, {
          id: 'purchasePrice',
          size: 150,
          meta: {
            title: t('page.products.table.purchasePrice'),
            filterable: true,
            filterType: 'number',
            sortable: true,
          },
          header: ({ column }) => sortHeader(column, t('page.products.table.purchasePrice')),
        }),
        columnHelper.accessor(row => row.purchaseCurrency.symbols[language] ?? '', {
          id: 'purchaseCurrency',
          size: 150,
          meta: {
            title: t('page.products.table.purchaseCurrency'),
            filterable: true,
            filterType: 'asyncValue',
            filterMultiple: true,
            sortable: true,
          },
          header: ({ column }) => sortHeader(column, t('page.products.table.purchaseCurrency')),
        }),
      ]
    }

    return [
      selectColumn(),
      columnHelper.accessor('seq', {
        id: 'seq',
        meta: {
          title: t('page.products.table.seq'),
          filterable: true,
          filterType: 'number',
          sortable: true,
        },
        header: ({ column }) => sortHeader(column, t('page.products.table.seq')),
      }),
      columnHelper.display({
        id: 'images',
        size: 100,
        meta: {
          title: t('page.products.table.images'),
          defaultVisible: true,
        },
        cell: ({ row }) => {
          const images = row.original.images.map((image, index) => ({
            id: String(index),
            src: image.path,
            alt: image.name,
          }))
          return (<ImageGallery images={images} />)
        },
      }),
      columnHelper.accessor(row => row.names?.[language] || row.names?.en, {
        id: 'names',
        size: 150,
        meta: {
          title: t('page.products.table.names'),
          filterable: true,
          filterType: 'text',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.products.table.names')),
      }),
      columnHelper.accessor(row => `${row.price} ${row.currency.symbols[language] ?? ''}`, {
        id: 'price',
        size: 150,
        meta: {
          title: t('page.products.table.price'),
          filterable: true,
          filterType: 'number',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.products.table.price')),
      }),
      columnHelper.accessor(row => row.currency.symbols[language] ?? '', {
        id: 'currency',
        size: 150,
        meta: {
          title: t('page.products.table.currency'),
          filterable: true,
          filterType: 'asyncValue',
          sortable: true,
          filterMultiple: true,
        },
        header: ({ column }) => sortHeader(column, t('page.products.table.currency')),
      }),
      ...permissionColumns(),
      columnHelper.display({
        id: 'quantity',
        size: 150,
        meta: {
          title: t('page.products.table.quantity'),
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.products.table.quantity')),
        cell: ({ row }) => {
          const quantity = row.original.warehouseStock.find(q => q.warehouse === filters.selectedWarehouse)
          const unit = row.original.unit.symbols[language] ?? ''
          return quantity ? `${quantity.count} ${unit}` : `0 ${unit}`
        },
      }),
      columnHelper.accessor(row => `${row.unit.names[language] ?? ''}`, {
        id: 'unit',
        size: 150,
        meta: {
          title: t('page.products.table.unit'),
          filterable: true,
          filterType: 'asyncValue',
          multiFilterable: true,
          sortable: true,
        },
        header: ({ column }) => sortHeader(column, t('page.products.table.unit')),
      }),
      columnHelper.display({
        id: 'categories',
        size: 150,
        meta: {
          title: t('page.products.table.categories'),
          filterable: true,
          filterType: 'asyncValue',
          multiFilterable: true,
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.products.table.categories')),
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            {row.original.categories.map(category => <Badge key={category.id}>{category.names[language]}</Badge>)}
          </div>
        ),
      }),
      columnHelper.accessor(row => `${row.productPropertiesGroup.names[language] ?? ''}`, {
        id: 'productPropertiesGroup',
        size: 150,
        meta: {
          title: t('page.products.table.productPropertyGroup'),
          sortable: true,
          filterable: true,
          filterType: 'asyncValue',
          multiFilterable: true,
        },
        header: ({ column }) => sortHeader(column, t('page.products.table.productPropertyGroup')),
      }),
      columnHelper.display({
        id: 'barcodes',
        size: 150,
        meta: {
          title: t('page.products.table.barcodes'),
          sortable: true,
        },
        header: ({ column }) => sortHeader(column, t('page.products.table.barcodes')),
        cell: ({ row }) => {
          const barcodes = row.original.barcodes.map(barcode => barcode.code)
          return (
            <div className="flex flex-wrap gap-2">
              {barcodes.map(barcode => (
                <Link target="_blank" to={`${backendUrl}api/barcodes/print?codes=${barcode}&size=55x40&language=${language}`} key={barcode}>
                  <Badge>
                    {barcode}
                  </Badge>
                </Link>
              ))}
            </div>
          )
        },
      }),
      ...productPropertyColumns(),
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
      actionColumn(),
    ]
  }, [language, filters.selectedWarehouse, isLoading, openModal, openLogsModal, removeProduct, productProperties, permissions, t])
  return columns
}
