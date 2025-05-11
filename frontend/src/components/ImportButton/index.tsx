import { Button, Input, Label } from '@/components/ui'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Download, Upload } from 'lucide-react'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface ImportButtonProps {
  isLoading?: boolean
  handleDownloadTemplate: () => void
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  isFileSelected: boolean
  onSubmit: (values) => void
}

export function ImportButton({
  isLoading = false,
  handleFileChange,
  handleDownloadTemplate,
  isFileSelected,
  onSubmit,
}: ImportButtonProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = async (values) => {
    await onSubmit(values)
    setIsOpen(false)
  }

  const handleCancel = () => {
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={isLoading}>
          <Upload className="mr-2 h-4 w-4" />
          {t('component.import.dialog.button')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('component.import.dialog.title')}</DialogTitle>
          <DialogDescription>{t('component.import.dialog.description')}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="file">{t('component.import.dialog.uploadLabel')}</Label>
            <Input id="file" type="file" accept=".csv,.xlsx,.xls,.json" onChange={handleFileChange} />
            <p className="text-sm text-muted-foreground">
              {t('component.import.dialog.supportedFormats')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-muted"></div>
            <span className="text-xs text-muted-foreground">{t('component.import.dialog.or')}</span>
            <div className="h-px flex-1 bg-muted"></div>
          </div>
          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {t('component.import.dialog.downloadTemplate')}
          </Button>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-0">
          <Button type="button" variant="outline" onClick={handleCancel}>
            {t('component.import.dialog.cancel')}
          </Button>
          <Button
            type="button"
            disabled={!isFileSelected}
            loading={isLoading}
            onClick={handleSubmit}
          >
            {t('component.import.dialog.import')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
