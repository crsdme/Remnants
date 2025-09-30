import { MoreHorizontal } from 'lucide-react'
import { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { cn } from '@/utils/lib'
import { PermissionGate } from '../PermissionGate'

interface Action {
  permission: string
  onClick?: () => void | Promise<void>
  label: string
  icon?: React.ReactNode
  isDestructive?: boolean
  isConfirm?: boolean
  type?: 'button' | 'link'
  link?: string
}

export function TableActionDropdown({ actions }: { actions?: Action[] }) {
  const [confirmAction, setConfirmAction] = useState<Action | null>(null)
  const { t } = useTranslation()

  if (!actions)
    return null

  const handleConfirm = async () => {
    if (!confirmAction)
      return
    try {
      await confirmAction.onClick?.()
      if (confirmAction.type === 'link' && confirmAction.link) {
        window.open(confirmAction.link, '_blank', 'noopener,noreferrer')
      }
    }
    finally {
      setConfirmAction(null)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" type="button">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          {actions.map(action => (
            <Fragment key={`${action.permission}-${action.label}`}>
              <PermissionGate permission={action.permission}>
                {action.isDestructive && <DropdownMenuSeparator />}

                <MenuItem
                  action={action}
                  onRequestConfirm={() => setConfirmAction(action)}
                />
              </PermissionGate>
            </Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={!!confirmAction}
        onOpenChange={(open) => {
          if (!open)
            setConfirmAction(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.isDestructive ? t('component.tableActionDropdown.deleteTitle') : t('component.tableActionDropdown.confirmTitle')}
            </AlertDialogTitle>
            {confirmAction?.isDestructive && (
              <AlertDialogDescription>
                {t('component.tableActionDropdown.deleteDescription')}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('component.tableActionDropdown.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={cn(
                confirmAction?.isDestructive
                && 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
              )}
            >
              {confirmAction?.isDestructive ? t('component.tableActionDropdown.delete') : t('component.tableActionDropdown.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function MenuItem({
  action,
  onRequestConfirm,
}: {
  action: Action
  onRequestConfirm: () => void
}) {
  const className = cn(
    'gap-2',
    action.isDestructive && 'text-destructive focus:text-destructive focus:bg-destructive/10',
  )
  const Content = (
    <>
      {action.icon}
      <span>{action.label}</span>
    </>
  )

  if (!action.isConfirm) {
    if (action.type === 'link') {
      return (
        <DropdownMenuItem asChild className={className}>
          <Link to={action.link || ''} target="_blank" onClick={() => action.onClick?.()}>
            {Content}
          </Link>
        </DropdownMenuItem>
      )
    }
    return (
      <DropdownMenuItem
        className={className}
        onSelect={() => action.onClick?.()}
      >
        {Content}
      </DropdownMenuItem>
    )
  }

  return (
    <DropdownMenuItem
      className={className}
      onSelect={() => {
        onRequestConfirm()
      }}
    >
      {Content}
    </DropdownMenuItem>
  )
}
