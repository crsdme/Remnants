import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ImportButton } from '@/components/ImportButton'
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
} from '@/components/ui'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

import { useLanguageContext } from '@/contexts'
import { downloadCsv } from '@/utils/helpers/download'

export function ActionBar() {
  const { t } = useTranslation()
  const languageContext = useLanguageContext()
  const [file, setFile] = useState<File | null>(null)

  const onSubmit = (values) => {
    languageContext.submitLanguageForm(values)
  }

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
    languageContext.importLanguages(formData)
    setFile(null)
  }

  const isLoading = languageContext.isLoading

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.languages.title')}</h2>
        <p className="text-muted-foreground">{t('page.languages.description')}</p>
      </div>
      <div className="flex items-center flex-wrap gap-2">
        <ImportButton
          handleFileChange={handleFileChange}
          handleDownloadTemplate={handleDownloadTemplate}
          isFileSelected={!!file}
          isLoading={isLoading}
          onSubmit={onImport}
        />
        <Sheet open={languageContext.isModalOpen} onOpenChange={() => !isLoading && languageContext.toggleModal()}>
          <SheetTrigger asChild>
            <Button onClick={() => languageContext.toggleModal()} disabled={isLoading}>
              <Plus />
              {t('page.languages.button.create')}
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-xl w-full overflow-y-auto" side="right">
            <SheetHeader>
              <SheetTitle>{t('page.languages.form.title.create')}</SheetTitle>
              <SheetDescription>
                {t('page.languages.form.description.create')}
              </SheetDescription>
            </SheetHeader>
            <div className="w-full px-4">
              <Form {...languageContext.form}>
                <form className="w-full space-y-4" onSubmit={languageContext.form.handleSubmit(onSubmit)}>
                  <FormField
                    control={languageContext.form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('page.languages.form.name')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('page.languages.form.name')}
                            className="w-full"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={languageContext.form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('page.languages.form.code')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('page.languages.form.code')}
                            className="w-full"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={languageContext.form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('page.languages.form.priority')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={t('page.languages.form.priority')}
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
                    control={languageContext.form.control}
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
                        <FormLabel>{t('page.languages.form.active')}</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={languageContext.form.control}
                    name="main"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormLabel>{t('page.languages.form.main')}</FormLabel>
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => languageContext.toggleModal()}
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
      </div>
    </div>
  )
}
