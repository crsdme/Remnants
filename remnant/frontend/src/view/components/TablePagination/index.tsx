import { useTranslation } from 'react-i18next';

import { Select, SelectContent, SelectItem, SelectTrigger } from '@/view/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious
} from '@/view/components/ui/pagination';
import { Button } from '@/view/components/ui/button';

export default function TablePagination({
  pagination,
  totalPages,
  changePagination,
  selectedCount,
  totalCount
}) {
  const { t } = useTranslation();
  return (
    <div className='flex justify-between items-center mt-3 max-md:flex-col gap-4'>
      <span className='text-sm text-muted-foreground'>
        {t('page.common.pagination.selected', {
          selected: selectedCount,
          total: totalCount
        })}
      </span>
      <div className='flex justify-end items-center max-md:flex-wrap-reverse gap-2 w-lg'>
        <span className='text-sm text-muted-foreground w-56 text-center'>
          {t('page.common.pagination.current', {
            current: pagination.current,
            total: totalPages
          })}
        </span>
        <Select onValueChange={(value) => changePagination({ pageSize: Number(value) })}>
          <SelectTrigger>{pagination.pageSize}</SelectTrigger>
          <SelectContent align='center'>
            <SelectItem value='10'>10</SelectItem>
            <SelectItem value='20'>20</SelectItem>
            <SelectItem value='50'>50</SelectItem>
          </SelectContent>
        </Select>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() =>
                  changePagination({
                    current: Math.max(pagination.current - 1, 1)
                  })
                }
                variant='outline'
                aria-disabled={pagination.current <= 1}
                tabIndex={pagination.current <= 1 ? -1 : undefined}
                className={pagination.current <= 1 ? 'pointer-events-none opacity-50' : undefined}
              />
            </PaginationItem>

            {(() => {
              const maxVisiblePages = 5;
              const startPage = Math.max(1, pagination.current - Math.floor(maxVisiblePages / 2));
              const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

              return Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                const pageNumber = startPage + i;
                return (
                  <PaginationItem key={pageNumber}>
                    <Button
                      variant={pagination.current === pageNumber ? 'default' : 'outline'}
                      size='icon'
                      onClick={() => changePagination({ current: pageNumber })}
                    >
                      {pageNumber}
                    </Button>
                  </PaginationItem>
                );
              });
            })()}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  changePagination({
                    current: Math.max(pagination.current + 1, totalPages)
                  })
                }
                variant='outline'
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
    // {totalPages > 1 && (
    //   <div className="flex items-center justify-between">
    //     <div className="flex items-center space-x-2">
    //       <span className="text-sm text-muted-foreground">Mostrar</span>
    //       <Select
    //         value={currentPageSize.toString()}
    //         onValueChange={(value) => {
    //           const newPageSize = Number.parseInt(value)
    //           setCurrentPageSize(newPageSize)
    //           setCurrentPage(1)
    //         }}
    //       >
    //         <SelectTrigger className="w-[70px]">
    //           <SelectValue placeholder={currentPageSize} />
    //         </SelectTrigger>
    //         <SelectContent>
    //           {pageSizeOptions.map((size) => (
    //             <SelectItem key={size} value={size.toString()}>
    //               {size}
    //             </SelectItem>
    //           ))}
    //         </SelectContent>
    //       </Select>
    //       <span className="text-sm text-muted-foreground">por página</span>
    //     </div>
    //     <div className="text-sm text-muted-foreground">
    //       Mostrando {(currentPage - 1) * currentPageSize + 1} a{" "}
    //       {Math.min(currentPage * currentPageSize, sortedAndGroupedData.length)} de {sortedAndGroupedData.length}{" "}
    //       resultados
    //     </div>
    //     <div className="flex items-center space-x-2">
    //       <Button variant="outline" size="icon" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
    //         <ChevronsLeft className="h-4 w-4" />
    //       </Button>
    //       <Button
    //         variant="outline"
    //         size="icon"
    //         onClick={() => handlePageChange(currentPage - 1)}
    //         disabled={currentPage === 1}
    //       >
    //         <ChevronLeft className="h-4 w-4" />
    //       </Button>

    //       <Select value={currentPage.toString()} onValueChange={(value) => handlePageChange(Number.parseInt(value))}>
    //         <SelectTrigger className="w-16">
    //           <SelectValue placeholder={currentPage} />
    //         </SelectTrigger>
    //         <SelectContent>
    //           {Array.from({ length: totalPages }, (_, i) => (
    //             <SelectItem key={i + 1} value={(i + 1).toString()}>
    //               {i + 1}
    //             </SelectItem>
    //           ))}
    //         </SelectContent>
    //       </Select>

    //       <span className="text-sm text-muted-foreground">de {totalPages}</span>

    //       <Button
    //         variant="outline"
    //         size="icon"
    //         onClick={() => handlePageChange(currentPage + 1)}
    //         disabled={currentPage === totalPages}
    //       >
    //         <ChevronRight className="h-4 w-4" />
    //       </Button>
    //       <Button
    //         variant="outline"
    //         size="icon"
    //         onClick={() => handlePageChange(totalPages)}
    //         disabled={currentPage === totalPages}
    //       >
    //         <ChevronsRight className="h-4 w-4" />
    //       </Button>
    //     </div>
    //   </div>
    // )}
  );
}
