import { useTranslation } from 'react-i18next';
import { Copy, Download, MoreVertical, Trash } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/view/components/ui/dropdown-menu';
import { Button } from '@/view/components/ui';

interface SelectionDropdownProps {
  selectedCount: number;
  onDelete?: () => void;
  onCopy?: () => void;
  onExport?: () => void;
}

export default function SelectionDropdown({
  selectedCount,
  onDelete,
  onCopy,
  onExport
}: SelectionDropdownProps) {
  const { t } = useTranslation();

  if (selectedCount === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant='outline' className='flex items-center gap-2'>
          <MoreVertical className='w-5 h-5' />
          <span>{t('component.tableSelection.selected', { count: selectedCount })}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {onCopy && (
          <DropdownMenuItem onClick={onCopy} className='flex items-center gap-2'>
            <Copy className='w-4 h-4' />
            {t('component.tableSelection.copyToClipboard')}
          </DropdownMenuItem>
        )}
        {onExport && (
          <DropdownMenuItem onClick={onExport} className='flex items-center gap-2'>
            <Download className='w-4 h-4' />
            {t('component.tableSelection.downloadCSV')}
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem onClick={onDelete} className='flex items-center gap-2 text-red-500'>
            <Trash className='w-4 h-4' />
            {t('component.tableSelection.delete')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
