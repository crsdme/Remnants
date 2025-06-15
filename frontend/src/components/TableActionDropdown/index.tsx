import { MoreHorizontal } from 'lucide-react'
import { Fragment } from 'react'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui'
import { cn } from '@/utils/lib'

import { PermissionGate } from '../PermissionGate'

export function TableActionDropdown(
  { actions }:
  { actions?: { permission: string, onClick: () => void, label: string, icon?: React.ReactNode, isDestructive?: boolean }[] },
) {
  if (!actions)
    return <></>

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">

          {actions?.map(action => (
            <Fragment key={`${action.permission}-${action.label}`}>
              {(action.isDestructive) && <DropdownMenuSeparator />}
              <PermissionGate key={action.permission} permission={action.permission}>
                <DropdownMenuItem onClick={action.onClick} className={cn('gap-2', action.isDestructive && 'text-destructive focus:text-destructive focus:bg-destructive/10')}>
                  {action.icon}
                  <span>{action.label}</span>
                </DropdownMenuItem>
              </PermissionGate>
            </Fragment>
          ))}

        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
