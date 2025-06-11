import { Copy, Edit, Files, MoreHorizontal, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PermissionGate } from '../PermissionGate/PermissionGate'

export function TableActionDropdown(
  { copyAction, editAction, duplicateAction, deleteAction, actions }:
  {
    copyAction?: { permission: string, onClick: () => void }
    editAction?: { permission: string, onClick: () => void }
    duplicateAction?: { permission: string, onClick: () => void }
    deleteAction?: { permission: string, onClick: () => void }
    actions?: { permission: string, onClick: () => void, label: string, icon?: React.ReactNode }[]
  },
) {
  const { t } = useTranslation()

  if (!copyAction && !editAction && !duplicateAction && !deleteAction)
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

          {/* <DropdownMenuItem onClick={() => onAction('Просмотр')} className="gap-2">
            <Eye className="h-4 w-4" />
            <span>{t('table.view')}</span>
          </DropdownMenuItem> */}

          {actions?.map(action => (
            <PermissionGate key={action.permission} permission={action.permission}>
              <DropdownMenuItem onClick={action.onClick} className="gap-2">
                {action.icon}
                <span>{action.label}</span>
              </DropdownMenuItem>
            </PermissionGate>
          ))}

          {editAction && (
            <PermissionGate permission={editAction.permission}>
              <DropdownMenuItem onClick={editAction.onClick} className="gap-2">
                <Edit className="h-4 w-4" />
                <span>{t('table.edit')}</span>
              </DropdownMenuItem>
            </PermissionGate>
          )}

          {copyAction && (
            <PermissionGate permission={copyAction.permission}>
              <DropdownMenuItem onClick={copyAction.onClick} className="gap-2">
                <Copy className="h-4 w-4" />
                <span>{t('table.copy')}</span>
              </DropdownMenuItem>
            </PermissionGate>
          )}

          {duplicateAction && (
            <PermissionGate permission={duplicateAction.permission}>
              <DropdownMenuItem onClick={duplicateAction.onClick} className="gap-2">
                <Files className="h-4 w-4" />
                <span>{t('table.duplicate')}</span>
              </DropdownMenuItem>
            </PermissionGate>
          )}

          {(editAction || copyAction || duplicateAction) && <DropdownMenuSeparator />}

          {/* <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2">
              <Download className="h-4 w-4" />
              <span>{t('table.export')}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => onAction('Экспорт PDF')} className="gap-2">
                <span className="text-red-600">📄</span>
                {t('table.export.pdf')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction('Экспорт Excel')} className="gap-2">
                <span className="text-green-600">📊</span>
                {t('table.export.excel')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction('Экспорт CSV')} className="gap-2">
                <span className="text-blue-600">📋</span>
                {t('table.export.csv')}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2">
              <Share className="h-4 w-4" />
              <span>{t('table.share')}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => onAction('Копирование ссылки')} className="gap-2">
                <Copy className="h-3 w-3" />
                {t('table.share.link')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction('Email')} className="gap-2">
                <span>✉️</span>
                {t('table.share.email')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction('Социальные сети')} className="gap-2">
                <span>🌐</span>
                {t('table.share.social')}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator /> */}

          {/* <DropdownMenuItem onClick={() => onAction('Избранное')} className="gap-2">
            <Star className="h-4 w-4" />
            <span>{t('table.favorite')}</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => onAction('Архивирование')} className="gap-2">
            <Archive className="h-4 w-4" />
            <span>{t('table.archive')}</span>
          </DropdownMenuItem> */}

          {deleteAction && (
            <PermissionGate permission={deleteAction.permission}>
              <DropdownMenuItem
                onClick={deleteAction.onClick}
                className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
                <span>{t('table.delete')}</span>
              </DropdownMenuItem>
            </PermissionGate>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
