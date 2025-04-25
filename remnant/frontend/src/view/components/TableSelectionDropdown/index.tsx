import { Button } from '@/view/components/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/view/components/ui/dropdown-menu'

import { Copy, Download, MoreVertical, Trash } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface SelectionDropdownProps {
  selectedCount: number
  onRemove?: () => void
  onCopy?: () => void
  onExport?: () => void
}

export default function TableSelectionDropdown({
  selectedCount,
  onRemove,
  onCopy,
  onExport,
}: SelectionDropdownProps) {
  const { t } = useTranslation()

  if (selectedCount === 0)
    return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
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
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
