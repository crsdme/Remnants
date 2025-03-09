import { useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/view/components/ui/dropdown-menu';
import { Button } from '@/view/components/ui/button';
import { Input } from '@/view/components/ui/input';
import { SearchIcon, Columns3, ChevronDown, RefreshCcw } from 'lucide-react';

export function ColumnVisibilityMenu({ table, tableId }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [columnVisibility, setColumnVisibility] = useState({});

  // ✅ Load visibility from localStorage on mount
  useEffect(() => {
    const savedVisibility = JSON.parse(localStorage.getItem(`${tableId}-columnVisibility`)) || {};
    setColumnVisibility(savedVisibility);
    table.setColumnVisibility(savedVisibility);
  }, [tableId]);

  // ✅ Save visibility to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`${tableId}-columnVisibility`, JSON.stringify(columnVisibility));
  }, [columnVisibility, tableId]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant='outline' className='ml-auto'>
          <Columns3 /> Columns <ChevronDown className='ml-3' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <div className='relative'>
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className='pl-8'
            placeholder='Search'
            onKeyDown={(event) => event.stopPropagation()}
          />
          <SearchIcon className='absolute inset-y-0 my-auto left-2 h-4 w-4' />
        </div>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter((column) => column.getCanHide())
          .map((column) => {
            if (searchQuery && !column.id.toLowerCase().includes(searchQuery.toLowerCase())) {
              return null;
            }

            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className='capitalize'
                checked={columnVisibility[column.id] ?? column.getIsVisible()}
                onCheckedChange={(value) => {
                  const newVisibility = { ...columnVisibility, [column.id]: value };
                  setColumnVisibility(newVisibility);
                  table.setColumnVisibility(newVisibility);
                }}
                onSelect={(e) => e.preventDefault()}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            );
          })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            table.resetColumnVisibility();
            setColumnVisibility({});
            localStorage.removeItem(`${tableId}-columnVisibility`);
            setSearchQuery('');
          }}
        >
          <RefreshCcw /> Reset
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
