import { ClipboardList, Copy, Download, MoreVertical, Printer, Trash } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAuthContext } from '@/contexts'
import { hasPermission } from '@/utils/helpers/permission'
import { cn } from '@/utils/lib'

interface SelectionDropdownProps {
  selectedCount: number
  onRemove?: () => void | Promise<void>
  removePermission?: string | string[]
  onCopy?: () => void
  copyPermission?: string | string[]
  onDuplicate?: () => void
  duplicatePermission?: string | string[]
  onExport?: () => void
  exportPermission?: string | string[]
  onPrint?: () => void
  printPermission?: string | string[]
}

export function TableSelectionDropdown({
  selectedCount,
  onRemove,
  removePermission,
  onCopy,
  copyPermission,
  onDuplicate,
  duplicatePermission,
  onExport,
  exportPermission,
  onPrint,
  printPermission,
}: SelectionDropdownProps) {
  const { t } = useTranslation()
  const { permissions } = useAuthContext()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const canCopy = !!onCopy && (!copyPermission || hasPermission(permissions, copyPermission))
  const canDuplicate = !!onDuplicate && (!duplicatePermission || hasPermission(permissions, duplicatePermission))
  const canExport = !!onExport && (!exportPermission || hasPermission(permissions, exportPermission))
  const canRemove = !!onRemove && (!removePermission || hasPermission(permissions, removePermission))
  const canPrint = !!onPrint && (!printPermission || hasPermission(permissions, printPermission))

  const hasActions = useMemo(
    () => canCopy || canDuplicate || canExport || canRemove || canPrint,
    [canCopy, canDuplicate, canExport, canRemove, canPrint],
  )

  if (selectedCount === 0 || !hasActions)
    return null

  const handleConfirmRemove = async () => {
    try {
      await onRemove?.()
    }
    finally {
      setIsConfirmOpen(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <MoreVertical className="w-5 h-5" />
            <span>{t('component.tableSelection.selected', { count: selectedCount })}</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          {canCopy && (
            <DropdownMenuItem onClick={onCopy} className="flex items-center gap-2">
              <Copy className="w-4 h-4" />
              {t('component.tableSelection.copyToClipboard')}
            </DropdownMenuItem>
          )}

          {canDuplicate && (
            <DropdownMenuItem onClick={onDuplicate} className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              {t('component.tableSelection.duplicate')}
            </DropdownMenuItem>
          )}

          {canExport && (
            <DropdownMenuItem onClick={onExport} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              {t('component.tableSelection.downloadCSV')}
            </DropdownMenuItem>
          )}

          {canRemove && (
            <DropdownMenuItem
              onSelect={() => setIsConfirmOpen(true)}
              className={cn(
                'flex items-center gap-2',
                'text-destructive focus:text-destructive focus:bg-destructive/10',
              )}
            >
              <Trash className="w-4 h-4" />
              {t('component.tableSelection.delete')}
            </DropdownMenuItem>
          )}

          {canPrint && (
            <DropdownMenuItem onClick={onPrint} className="flex items-center gap-2">
              <Printer className="w-4 h-4" />
              {t('component.tableSelection.print')}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {canRemove && (
        <AlertDialog
          open={isConfirmOpen}
          onOpenChange={(open) => {
            if (!open)
              setIsConfirmOpen(false)
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t('component.tableSelection.deleteTitle')}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t('component.tableSelection.deleteDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {t('component.tableSelection.cancel')}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => void handleConfirmRemove()}
                className={cn(
                  'bg-destructive text-white hover:bg-destructive/70',
                  'focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
                )}
              >
                {t('component.tableSelection.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
