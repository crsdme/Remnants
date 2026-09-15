import { MoreHorizontal } from 'lucide-react'
import { Fragment, useMemo, useState } from 'react'
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
import { useAuthContext } from '@/contexts'
import { hasPermission } from '@/utils/helpers/permission'
import { cn } from '@/utils/lib'

interface Action {
  permission: string | string[]
  onClick?: () => void | Promise<void>
  label: string
  icon?: React.ReactNode
  isDestructive?: boolean
  isConfirm?: boolean
  confirmTitle?: string
  confirmDescription?: string
  confirmLabel?: string
  type?: 'button' | 'link'
  link?: string
  /** Open link in the same tab (default for in-app routes). */
  openInNewTab?: boolean
}

export function TableActionDropdown({ actions }: { actions?: Action[] }) {
  const [confirmAction, setConfirmAction] = useState<Action | null>(null)
  const { t } = useTranslation()
  const { permissions } = useAuthContext()

  const visibleActions = useMemo(
    () => (actions ?? []).filter(action => hasPermission(permissions, action.permission)),
    [actions, permissions],
  )

  if (visibleActions.length === 0)
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
          {visibleActions.map(action => (
            <Fragment key={`${Array.isArray(action.permission) ? action.permission.join('|') : action.permission}-${action.label}`}>
              {action.isDestructive && <DropdownMenuSeparator />}

              <MenuItem
                action={action}
                onRequestConfirm={() => setConfirmAction(action)}
              />
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
              {confirmAction?.confirmTitle
                ?? (confirmAction?.isDestructive
                  ? t('component.tableActionDropdown.deleteTitle')
                  : t('component.tableActionDropdown.confirmTitle'))}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.confirmDescription
                ?? (confirmAction?.isDestructive
                  ? t('component.tableActionDropdown.deleteDescription')
                  : t('component.tableActionDropdown.confirmDescription'))}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('component.tableActionDropdown.cancel')}
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={() => void handleConfirm()}
              className={cn(
                confirmAction?.isDestructive
                && 'bg-destructive text-white hover:bg-destructive/70 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
              )}
            >
              {confirmAction?.confirmLabel
                ?? (confirmAction?.isDestructive
                  ? t('component.tableActionDropdown.delete')
                  : t('component.tableActionDropdown.confirm'))}
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
          <Link
            to={action.link || ''}
            target={action.openInNewTab ? '_blank' : undefined}
            rel={action.openInNewTab ? 'noopener noreferrer' : undefined}
            onClick={() => void action.onClick?.()}
          >
            {Content}
          </Link>
        </DropdownMenuItem>
      )
    }
    return (
      <DropdownMenuItem
        className={className}
        onSelect={() => void action.onClick?.()}
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
