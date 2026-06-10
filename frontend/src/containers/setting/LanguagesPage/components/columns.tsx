import type { LanguageDTO } from '@remnant/shared'
import type { Column } from '@tanstack/react-table'
import { createColumnHelper } from '@tanstack/react-table'
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Copy,
  Pencil,
  Trash,
} from 'lucide-react'
import { useMemo } from 'react'

import { TableActionDropdown } from '@/components'
import { Badge, Button } from '@/components/ui'
import { formatDate } from '@/utils/helpers'
import { useLocale } from '@/utils/hooks'
import { useLanguageContext } from '../context'

const sortIcons = { asc: ArrowUp, desc: ArrowDown }
const columnHelper = createColumnHelper<LanguageDTO>()

export function useColumns() {
  const { t, language } = useLocale()
  const { isLoading, openModal, removeLanguages } = useLanguageContext()

  const columns = useMemo(() => {
    function sortHeader(column: Column<LanguageDTO, unknown>, label: string) {
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
          const item = row.original

          const actions = [
            {
              permission: 'language.copy',
              onClick: async () => navigator.clipboard.writeText(item.id),
              label: t('table.copy'),
              icon: <Copy className="h-4 w-4" />,
            },
            {
              permission: 'language.edit',
              onClick: () => openModal(item),
              label: t('table.edit'),
              icon: <Pencil className="h-4 w-4" />,
            },
            {
              permission: 'language.delete',
              onClick: () => removeLanguages({ ids: [item.id] }),
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

    return [
      columnHelper.accessor('name', {
        id: 'name',
        size: 150,
        meta: {
          title: t('page.languages.table.name'),
          batchEdit: true,
          batchEditType: 'text',
          filterable: true,
          filterType: 'text',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.languages.table.name')),
      }),
      columnHelper.accessor('code', {
        id: 'code',
        meta: {
          title: t('page.languages.table.code'),
          batchEdit: true,
          batchEditType: 'text',
          filterable: true,
          filterType: 'text',
          sortable: true,
          defaultVisible: true,
        },
        header: () => t('page.languages.table.code'),
        cell: ({ row }) => (
          <Badge variant="outline">
            {row.original.code}
          </Badge>
        ),
      }),
      columnHelper.accessor('priority', {
        id: 'priority',
        meta: {
          title: t('page.languages.table.priority'),
          batchEdit: true,
          batchEditType: 'number',
          filterable: true,
          filterType: 'number',
          sortable: true,
          defaultVisible: true,
        },
        header: ({ column }) => sortHeader(column, t('page.languages.table.priority')),
        cell: ({ row }) => <Badge variant="outline">{row.original.priority}</Badge>,
      }),
      columnHelper.accessor('active', {
        id: 'active',
        meta: {
          title: t('page.languages.table.active'),
          batchEdit: true,
          batchEditType: 'boolean',
          filterable: true,
          filterType: 'boolean',
          sortable: true,
          defaultVisible: true,
        },
        header: t('page.languages.table.active'),
        cell: ({ row }) => <Badge variant={row.original.active ? 'success' : 'destructive'}>{t(`table.active.${row.original.active}`)}</Badge>,
      }),
      columnHelper.accessor('main', {
        id: 'main',
        meta: {
          title: t('page.languages.table.main'),
          batchEdit: true,
          batchEditType: 'boolean',
          filterable: true,
          filterType: 'boolean',
          sortable: true,
          defaultVisible: true,
        },
        header: t('page.languages.table.main'),
        cell: ({ row }) => <Badge variant={row.original.main ? 'success' : 'destructive'}>{t(`table.yesno.${row.original.main}`)}</Badge>,
      }),
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
  }, [language, isLoading, openModal, removeLanguages, t])
  return columns
}
