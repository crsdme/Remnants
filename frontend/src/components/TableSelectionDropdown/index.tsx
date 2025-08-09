import { ClipboardList, Copy, Download, MoreVertical, Printer, Trash } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui'

interface SelectionDropdownProps {
  selectedCount: number
  onRemove?: () => void
  onCopy?: () => void
  onDuplicate?: () => void
  onExport?: () => void
  onPrint?: () => void
}

export function TableSelectionDropdown({
  selectedCount,
  onRemove,
  onCopy,
  onDuplicate,
  onExport,
  onPrint,
}: SelectionDropdownProps) {
  const { t } = useTranslation()

  if (selectedCount === 0)
    return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <MoreVertical className="w-5 h-5" />
          <span>{t('component.tableSelection.selected', { count: selectedCount })}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onCopy && (
          <DropdownMenuItem onClick={onCopy} className="flex items-center gap-2">
            <Copy className="w-4 h-4" />
            {t('component.tableSelection.copyToClipboard')}
          </DropdownMenuItem>
        )}
        {onDuplicate && (
          <DropdownMenuItem onClick={onDuplicate} className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            {t('component.tableSelection.duplicate')}
          </DropdownMenuItem>
        )}
        {onExport && (
          <DropdownMenuItem onClick={onExport} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            {t('component.tableSelection.downloadCSV')}
          </DropdownMenuItem>
        )}
        {onRemove && (
          <DropdownMenuItem
            onClick={onRemove}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Trash className="w-4 h-4" />
            {t('component.tableSelection.delete')}
          </DropdownMenuItem>
        )}
        {onPrint && (
          <DropdownMenuItem onClick={onPrint} className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            {t('component.tableSelection.print')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
