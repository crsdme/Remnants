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

export function TableActionDropdown({ copyAction, editAction, duplicateAction, deleteAction }) {
  const { t } = useTranslation()

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

          <PermissionGate permission={editAction.permission}>
            <DropdownMenuItem onClick={editAction.onClick} className="gap-2">
              <Edit className="h-4 w-4" />
              <span>{t('table.edit')}</span>
            </DropdownMenuItem>
          </PermissionGate>

          <PermissionGate permission={copyAction.permission}>
            <DropdownMenuItem onClick={copyAction.onClick} className="gap-2">
              <Copy className="h-4 w-4" />
              <span>{t('table.copy')}</span>
            </DropdownMenuItem>
          </PermissionGate>

          <PermissionGate permission={duplicateAction.permission}>
            <DropdownMenuItem onClick={duplicateAction.onClick} className="gap-2">
              <Files className="h-4 w-4" />
              <span>{t('table.duplicate')}</span>
            </DropdownMenuItem>
          </PermissionGate>

          <DropdownMenuSeparator />

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

          <PermissionGate permission={deleteAction.permission}>
            <DropdownMenuItem
              onClick={deleteAction.onClick}
              className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              <span>{t('table.delete')}</span>
            </DropdownMenuItem>
          </PermissionGate>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    // <div className="flex items-center gap-2">
    //   <DropdownMenu>
    //     <DropdownMenuTrigger asChild>
    //       <Button variant="ghost" className="h-8 w-8 p-0">
    //         <MoreHorizontal className="h-4 w-4" />
    //       </Button>
    //     </DropdownMenuTrigger>
    //     <DropdownMenuContent align="end">
    //       <DropdownMenuLabel>{t('table.actions')}</DropdownMenuLabel>
    //       <DropdownMenuSeparator />
    //       <DropdownMenuItem onClick={onCopy}>
    //         {t('table.copy')}
    //       </DropdownMenuItem>
    //       <DropdownMenuItem onClick={onEdit}>
    //         {t('table.edit')}
    //       </DropdownMenuItem>
    //       <DropdownMenuItem
    //         onClick={onDuplicate}
    //       >
    //         {t('table.duplicate')}
    //       </DropdownMenuItem>
    //       <DropdownMenuItem
    //         onClick={onDelete}
    //         variant="destructive"
    //       >
    //         {t('table.delete')}
    //       </DropdownMenuItem>
    //     </DropdownMenuContent>
    //   </DropdownMenu>
    // </div>
  )
}
