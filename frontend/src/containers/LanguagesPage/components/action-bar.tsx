import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ImportButton, PermissionGate } from '@/components'
import {
  Button,

  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui'
import { useLanguageContext } from '@/contexts'
import { downloadCsv } from '@/utils/helpers/download'
import { LanguageForm } from './form'

export function ActionBar() {
  const { t } = useTranslation()
  const { isModalOpen, isLoading, isEdit, openModal, closeModal, importLanguages } = useLanguageContext()
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      setFile(file)
    }
  }

  const handleDownloadTemplate = () => {
    const headers = [
      'name',
      'code',
      'priority',
      'active',
      'main',
    ]

    const row = [
      'English',
      'en',
      '1',
      'true',
      'false',
    ]

    const csv = [headers, row].map(r => r.join(',')).join('\n')

    downloadCsv(csv, 'languages-template.csv', false)
  }

  const onImport = async () => {
    const formData = new FormData()
    formData.append('file', file)
    importLanguages(formData)
    setFile(null)
  }

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.languages.title')}</h2>
        <p className="text-muted-foreground">{t('page.languages.description')}</p>
      </div>
      <div className="flex items-center flex-wrap gap-2">
        <PermissionGate permission="language.import">
          <ImportButton
            handleFileChange={handleFileChange}
            handleDownloadTemplate={handleDownloadTemplate}
            isFileSelected={!!file}
            isLoading={isLoading}
            onSubmit={onImport}
          />
        </PermissionGate>
        <PermissionGate permission={['language.create']}>
          <Sheet open={isModalOpen} onOpenChange={() => closeModal()}>
            <SheetTrigger asChild>
              <Button onClick={() => openModal()} disabled={isLoading}>
                <Plus />
                {t('page.languages.button.create')}
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-xl w-full overflow-y-auto" side="right">
              <SheetHeader>
                <SheetTitle>{t(`page.languages.form.title.${isEdit ? 'edit' : 'create'}`)}</SheetTitle>
                <SheetDescription>
                  {t(`page.languages.form.description.${isEdit ? 'edit' : 'create'}`)}
                </SheetDescription>
              </SheetHeader>
              <div className="w-full pb-4 px-4">
                <LanguageForm />
              </div>
            </SheetContent>
          </Sheet>
        </PermissionGate>
      </div>
    </div>
  )
}
