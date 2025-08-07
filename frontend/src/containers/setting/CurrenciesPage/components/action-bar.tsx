import { Plus } from 'lucide-react'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLanguageQuery } from '@/api/hooks'
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
import { useCurrencyContext } from '@/contexts'
import { downloadCsv } from '@/utils/helpers/download'

import { CurrencyForm, ExchangeRateForm } from './form'

export function ActionBar() {
  const { t } = useTranslation()
  const {
    isModalOpen,
    isLoading,
    isEdit,
    isExchangeRateModalOpen,
    openModal,
    closeModal,
    importCurrencies,
    closeExchangeRateModal,
  } = useCurrencyContext()
  const [file, setFile] = useState<File | null>(null)

  const { data: { languages = [] } = {} } = useLanguageQuery(
    { pagination: { full: true } },
    { options: {
      select: response => ({
        languages: response.data.languages,
      }),
    } },
  )

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      setFile(file)
    }
  }

  const handleDownloadTemplate = () => {
    const headers = [
      ...languages.map(l => `names_${l.code}`),
      ...languages.map(l => `symbols_${l.code}`),
      'priority',
      'active',
    ]

    const row = [
      ...languages.map(() => t(`component.import.dialog.template.name`)),
      ...languages.map(() => t(`component.import.dialog.template.symbol`)),
      '1',
      'true',
    ]

    const csv = [headers, row].map(r => r.join(',')).join('\n')

    downloadCsv(csv, 'currencies-template.csv', false)
  }

  const onImport = async () => {
    const formData = new FormData()
    formData.append('file', file)
    importCurrencies(formData)
    setFile(null)
  }

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.currencies.title')}</h2>
        <p className="text-muted-foreground">{t('page.currencies.description')}</p>
      </div>
      <div className="flex items-center flex-wrap gap-2">
        <PermissionGate permission="currency.import">
          <ImportButton
            handleFileChange={handleFileChange}
            handleDownloadTemplate={handleDownloadTemplate}
            isFileSelected={!!file}
            isLoading={isLoading}
            onSubmit={onImport}
          />
        </PermissionGate>
        <PermissionGate permission={['currency.create']}>
          <Sheet open={isModalOpen} onOpenChange={() => closeModal()}>
            <SheetTrigger asChild>
              <Button onClick={() => openModal()} disabled={isLoading}>
                <Plus />
                {t('page.currencies.button.create')}
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-xl w-full overflow-y-auto" side="right">
              <SheetHeader>
                <SheetTitle>{t(`page.currencies.form.title.${isEdit ? 'edit' : 'create'}`)}</SheetTitle>
                <SheetDescription>
                  {t(`page.currencies.form.description.${isEdit ? 'edit' : 'create'}`)}
                </SheetDescription>
              </SheetHeader>
              <div className="w-full pb-4 px-4">
                <CurrencyForm />
              </div>
            </SheetContent>
          </Sheet>
        </PermissionGate>
        <PermissionGate permission={['exchange-rate.edit']}>
          <Sheet open={isExchangeRateModalOpen} onOpenChange={() => closeExchangeRateModal()}>
            <SheetContent className="sm:max-w-xl w-full overflow-y-auto" side="right">
              <SheetHeader>
                <SheetTitle>{t(`page.currencies.form.title.edit-exchange-rate`)}</SheetTitle>
                <SheetDescription>
                  {t(`page.currencies.form.description.edit-exchange-rate`)}
                </SheetDescription>
              </SheetHeader>
              <div className="w-full pb-4 px-4">
                <ExchangeRateForm />
              </div>
            </SheetContent>
          </Sheet>
        </PermissionGate>
      </div>
    </div>
  )
}
