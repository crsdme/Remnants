import { useTranslation } from 'react-i18next'

import {
  Button,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui'

export function TablePagination({
  pagination,
  totalPages,
  changePagination,
  selectedCount = 0,
  totalCount,
}) {
  const { t } = useTranslation()
  if (totalPages <= 1)
    return null

  return (
    <div className="flex justify-end py-2 max-md:flex-col gap-4">
      { selectedCount > 0 && (
        <span className="text-sm text-muted-foreground w-full">
          {t('component.pagination.selected', {
            selected: selectedCount,
            total: totalCount,
          })}
        </span>
      )}
      <div className="flex justify-end items-center gap-2 max-md:flex-wrap min-md:w-lg">
        <span className="text-sm text-muted-foreground text-center mr-2">
          {t('component.pagination.current', {
            current: pagination.current,
            total: totalPages,
          })}
        </span>
        <Select onValueChange={value => changePagination({ pageSize: Number(value) })}>
          <SelectTrigger>{pagination.pageSize}</SelectTrigger>
          <SelectContent align="center">
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
        <Pagination className="justify-end m-0">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() =>
                  changePagination({
                    current: Math.max(pagination.current - 1, 1),
                  })}
                variant="outline"
                aria-disabled={pagination.current <= 1}
                tabIndex={pagination.current <= 1 ? -1 : undefined}
                className={pagination.current <= 1 ? 'pointer-events-none opacity-50' : undefined}
              />
            </PaginationItem>

            {(() => {
              const maxVisiblePages = 5
              const startPage = Math.max(1, pagination.current - Math.floor(maxVisiblePages / 2))
              const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

              return Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                const pageNumber = startPage + i
                return (
                  <PaginationItem key={pageNumber}>
                    <Button
                      variant={pagination.current === pageNumber ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => changePagination({ current: pageNumber })}
                    >
                      {pageNumber}
                    </Button>
                  </PaginationItem>
                )
              })
            })()}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  changePagination({
                    current: Math.max(pagination.current + 1, totalPages),
                  })}
                variant="outline"
                aria-disabled={!(pagination.current < totalPages)}
                tabIndex={!(pagination.current < totalPages) ? -1 : undefined}
                className={
                  !(pagination.current < totalPages) ? 'pointer-events-none opacity-50' : undefined
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
