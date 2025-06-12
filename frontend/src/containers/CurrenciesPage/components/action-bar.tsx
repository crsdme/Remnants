import { Plus } from 'lucide-react'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRequestLanguages } from '@/api/hooks'
import { ImportButton, PermissionGate } from '@/components'
import {
  Button,
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui'
import { useCurrencyContext } from '@/contexts'
import { downloadCsv } from '@/utils/helpers/download'

export function ActionBar() {
  const { t } = useTranslation()
  const currencyContext = useCurrencyContext()
  const [file, setFile] = useState<File | null>(null)

  const requestLanguages = useRequestLanguages({ pagination: { full: true } })
  const languages = requestLanguages?.data?.data?.languages || []

  const onSubmit = (values) => {
    currencyContext.submitCurrencyForm(values)
  }

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
    currencyContext.importCurrencies(formData)
    setFile(null)
  }

  const isLoading = currencyContext.isLoading

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
          <Sheet open={currencyContext.isModalOpen} onOpenChange={() => !isLoading && currencyContext.toggleModal()}>
            <SheetTrigger asChild>
              <Button onClick={() => currencyContext.toggleModal()} disabled={isLoading}>
                <Plus />
                {t('page.currencies.button.create')}
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-xl w-full overflow-y-auto" side="right">
              <SheetHeader>
                <SheetTitle>{t(`page.currencies.form.title.${currencyContext.selectedCurrency ? 'edit' : 'create'}`)}</SheetTitle>
                <SheetDescription>
                  {t(`page.currencies.form.description.${currencyContext.selectedCurrency ? 'edit' : 'create'}`)}
                </SheetDescription>
              </SheetHeader>
              <div className="w-full pb-4 px-4">
                <Form {...currencyContext.form}>
                  <form className="w-full space-y-4" onSubmit={currencyContext.form.handleSubmit(onSubmit)}>
                    {languages.map(language => (
                      <FormField
                        control={currencyContext.form.control}
                        key={language.code}
                        name={`names.${language.code}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t('page.currencies.form.names', {
                                language: t(`language.${language.code}`),
                              })}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t('page.currencies.form.names', {
                                  language: t(`language.${language.code}`),
                                })}
                                className="w-full"
                                {...field}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                    {languages.map(language => (
                      <FormField
                        control={currencyContext.form.control}
                        key={language.code}
                        name={`symbols.${language.code}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t('page.currencies.form.symbols', {
                                language: t(`language.${language.code}`),
                              })}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t('page.currencies.form.symbols', {
                                  language: t(`language.${language.code}`),
                                })}
                                className="w-full"
                                {...field}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                    <FormField
                      control={currencyContext.form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('page.currencies.form.priority')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={t('page.currencies.form.priority')}
                              className="w-full"
                              {...field}
                              disabled={isLoading}
                              onChange={e => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={currencyContext.form.control}
                      name="active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormLabel>{t('page.currencies.form.active')}</FormLabel>
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => currencyContext.toggleModal()}
                        disabled={isLoading}
                      >
                        {t('button.cancel')}
                      </Button>
                      <Button type="submit" disabled={isLoading} loading={isLoading}>
                        {t('button.submit')}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </SheetContent>
          </Sheet>
        </PermissionGate>
      </div>
    </div>
  )
}
