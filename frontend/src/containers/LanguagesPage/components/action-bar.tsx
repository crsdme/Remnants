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
import { useLanguageContext } from '@/utils/contexts'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

const formSchema = z.object({
  name: z.string(),
  code: z.string(),
  priority: z.number().default(0),
  active: z.boolean().default(true),
  main: z.boolean().default(false),
})

export function ActionBar() {
  const { t } = useTranslation()
  const languageContext = useLanguageContext()
  const [file, setFile] = useState<File | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      code: '',
      priority: 0,
      active: true,
      main: false,
    },
  })

  const onSubmit = (values) => {
    languageContext.submitLanguageForm(values)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
    const blob = new Blob([csv], { type: 'text/csv' })

    const link = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: 'languages-template.csv',
    })

    link.click()
    URL.revokeObjectURL(link.href)
  }

  const onImport = async () => {
    const formData = new FormData()
    formData.append('file', file)
    languageContext.importLanguages(formData)
    setFile(null)
  }

  useEffect(() => {
    const language = languageContext.selectedLanguage
    let languageValues = {}
    if (language) {
      languageValues = {
        name: language.name,
        code: language.code,
        priority: language.priority,
        active: language.active,
        main: language.main,
      }
    }

    form.reset(languageValues)
  }, [languageContext.isModalOpen])

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
              <Form {...form}>
                <form className="w-full space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                  <FormField
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
