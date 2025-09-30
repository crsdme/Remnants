import type { MouseEvent, ReactNode } from 'react'

import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Popover, PopoverContent, PopoverTrigger } from '@/components/ui'

interface Props {
  children: ReactNode
  onConfirm: () => void | Promise<void>
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  disabled?: boolean
}

export function ConfirmPopover({
  children,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  side = 'top',
  align = 'center',
  disabled = false,
}: Props) {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  const handleCancel = (e: MouseEvent) => {
    e.stopPropagation()
    setOpen(false)
  }

  const handleConfirm = async (e: MouseEvent) => {
    e.stopPropagation()
    try {
      setPending(true)
      await onConfirm()
      setOpen(false)
    }
    finally {
      setPending(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span aria-disabled={disabled}>
          {children}
        </span>
      </PopoverTrigger>
      <PopoverContent side={side} align={align} className="w-64">
        <div className="space-y-2">
          <p className="text-sm font-medium">{title || t('component.confirmPopover.title')}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description || t('component.confirmPopover.description')}</p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" type="button" onClick={handleCancel} disabled={pending}>
              {cancelText || t('component.confirmPopover.cancelText')}
            </Button>
            <Button variant="destructive" size="sm" type="button" onClick={handleConfirm} disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmText || t('component.confirmPopover.confirmText')}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
