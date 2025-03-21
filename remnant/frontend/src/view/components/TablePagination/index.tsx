import { useTranslation } from 'react-i18next';

import { Select, SelectContent, SelectItem, SelectTrigger } from '@/view/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/view/components/ui/pagination';

export default function TablePagination({
  pagination,
  totalPages,
  changePagination,
  selectedCount,
  totalCount
}) {
  const { t } = useTranslation();
  return (
    <div className='flex justify-between items-center mt-4 flex-wrap gap-4'>
      <span className='text-sm text-muted-foreground'>
        {t('page.common.pagination.selected', {
          selected: selectedCount,
          total: totalCount
        })}
      </span>
      <div className='flex justify-end items-center gap-4 flex-wrap'>
        <Select onValueChange={(value) => changePagination({ pageSize: Number(value) })}>
          <SelectTrigger>{pagination.pageSize}</SelectTrigger>
          <SelectContent>
            <SelectItem value='10'>10</SelectItem>
            <SelectItem value='20'>20</SelectItem>
            <SelectItem value='50'>50</SelectItem>
          </SelectContent>
        </Select>
        <span className='text-sm text-muted-foreground w-40'>
          {t('page.common.pagination.current', {
            current: pagination.current,
            total: totalPages
          })}
        </span>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href='#'
                onClick={() =>
                  changePagination({
                    current: Math.max(pagination.current - 1, 1)
                  })
                }
                aria-disabled={pagination.current <= 1}
                tabIndex={pagination.current <= 1 ? -1 : undefined}
                className={pagination.current <= 1 ? 'pointer-events-none opacity-50' : undefined}
              />
            </PaginationItem>

            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i + 1}>
                <PaginationLink
                  href='#'
                  isActive={pagination.current === i + 1}
                  onClick={() =>
                    changePagination({
                      current: i + 1
                    })
                  }
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            {totalPages > 5 && <PaginationEllipsis />}

            <PaginationItem>
              <PaginationNext
                href='#'
                onClick={() =>
                  changePagination({
                    current: Math.max(pagination.current + 1, totalPages)
                  })
                }
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
  );
}
