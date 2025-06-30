import { ChevronDown, Columns3, RefreshCcw, SearchIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button, DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, Input } from '@/components/ui'

export function ColumnVisibilityMenu(
  { table, tableId, className, align = 'end' }:
  { table: any, tableId: string, className?: string, align?: 'start' | 'center' | 'end' },
) {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [columnVisibility, setColumnVisibility] = useState({})

  useEffect(() => {
    const savedVisibility = JSON.parse(localStorage.getItem(`${tableId}-columns`) || '{}')
    const updatedVisibility = { ...savedVisibility }

    table.getAllColumns().forEach((column) => {
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
    setColumnVisibility(updatedVisibility)
    table.setColumnVisibility(updatedVisibility)
  }, [tableId, table.getAllColumns().map(col => col.id).join(',')])

  useEffect(() => {
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
          .filter(column => column.getCanHide())
          .map((column) => {
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
                checked={columnVisibility[column.id] ?? column.getIsVisible()}
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
