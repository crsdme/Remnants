import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/view/components/ui/dropdown-menu';
import { Button } from '@/view/components/ui';
import { MoreVertical, Trash, Copy, Download } from 'lucide-react';

interface SelectionDropdownProps {
  selectedCount: number;
  onDelete: () => void;
  onCopy: () => void;
  onExport: () => void;
}

export default function SelectionDropdown({
  selectedCount,
  onDelete,
  onCopy,
  onExport
}: SelectionDropdownProps) {
  if (selectedCount === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant='outline' className='flex items-center gap-2'>
          <MoreVertical className='w-5 h-5' />
          <span>{selectedCount} выбрано</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={onCopy} className='flex items-center gap-2'>
          <Copy className='w-4 h-4' />
          Копировать в буфер обмена
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExport} className='flex items-center gap-2'>
          <Download className='w-4 h-4' />
          Скачать CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} className='flex items-center gap-2 text-red-500'>
          <Trash className='w-4 h-4' />
          Удалить
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
