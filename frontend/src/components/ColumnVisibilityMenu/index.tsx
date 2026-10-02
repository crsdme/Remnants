import { ChevronDown, Columns3, RefreshCcw, SearchIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button, DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, Input } from '@/components/ui'

type VisibilityMap = Record<string, boolean>

function isSameVisibility(a: VisibilityMap, b: VisibilityMap) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const key of keys) {
    if (a[key] !== b[key])
      return false
  }
  return true
}

export function ColumnVisibilityMenu(
  { table, tableId, className, align = 'end' }:
  { table: any, tableId: string, className?: string, align?: 'start' | 'center' | 'end' },
) {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [columnVisibility, setColumnVisibility] = useState<VisibilityMap>({})
  const tableRef = useRef(table)
  tableRef.current = table

  const columnIdsKey = table.getAllColumns().map((col: any) => col.id).join(',')

  useEffect(() => {
    const currentTable = tableRef.current
    const savedVisibility = JSON.parse(localStorage.getItem(`${tableId}-columns`) || '{}') as VisibilityMap
    const updatedVisibility: VisibilityMap = { ...savedVisibility }

    currentTable.getAllColumns().forEach((column: any) => {
      const id = column.id
      const defaultVisible = column.columnDef.meta?.defaultVisible ?? false

      if (!(id in savedVisibility)) {
        updatedVisibility[id] = defaultVisible
      }

      if (['action', 'select', 'expander'].includes(id)) {
        updatedVisibility[id] = true
      }
    })

    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
    setColumnVisibility(prev => (isSameVisibility(prev, updatedVisibility) ? prev : updatedVisibility))

    const tableVisibility = currentTable.getState().columnVisibility as VisibilityMap
    if (!isSameVisibility(tableVisibility, updatedVisibility))
      currentTable.setColumnVisibility(updatedVisibility)
  }, [tableId, columnIdsKey])

  useEffect(() => {
    if (Object.keys(columnVisibility).length === 0)
      return
    localStorage.setItem(`${tableId}-columns`, JSON.stringify(columnVisibility))
  }, [columnVisibility, tableId])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={className}>
          <Columns3 />
          {t('component.columnMenu.title')}
          <ChevronDown className="ml-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        <div className="relative">
          <Input
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
            className="pl-8"
            placeholder={t('component.columnMenu.searchPlaceholder')}
            onKeyDown={event => event.stopPropagation()}
          />
          <SearchIcon className="absolute inset-y-0 my-auto left-2 h-4 w-4" />
        </div>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter((column: any) => column.getCanHide())
          .map((column: any) => {
            const displayName = column.columnDef.meta?.title || column.id

            if (
              searchQuery
              && !displayName.toLowerCase().includes(searchQuery.toLowerCase())
              && !column.id.toLowerCase().includes(searchQuery.toLowerCase())
            ) {
              return null
            }

            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={columnVisibility[column.id as keyof typeof columnVisibility] ?? column.getIsVisible()}
                onCheckedChange={(value) => {
                  const newVisibility = { ...columnVisibility, [column.id]: value }
                  setColumnVisibility(newVisibility)
                  table.setColumnVisibility(newVisibility)
                }}
                onSelect={e => e.preventDefault()}
              >
                {displayName}
              </DropdownMenuCheckboxItem>
            )
          })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            table.resetColumnVisibility()
            setColumnVisibility({})
            localStorage.removeItem(`${tableId}-columns`)
            setSearchQuery('')
          }}
        >
          <RefreshCcw />
          {t('component.columnMenu.reset')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
