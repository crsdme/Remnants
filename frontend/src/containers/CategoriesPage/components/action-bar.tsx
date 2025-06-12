import { Plus } from 'lucide-react'

import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRequestLanguages } from '@/api/hooks'
import { getCategories } from '@/api/requests'
import { AsyncSelect } from '@/components/AsyncSelect'
import { ImportButton } from '@/components/ImportButton'
import { PermissionGate } from '@/components/PermissionGate/PermissionGate'
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
import { useCategoryContext } from '@/contexts'

export function ActionBar() {
  const { t, i18n } = useTranslation()
  const categoryContext = useCategoryContext()
  const [file, setFile] = useState<File | null>(null)

  const requestLanguages = useRequestLanguages({ pagination: { full: true } })
  const languages = requestLanguages?.data?.data?.languages || []

  const onSubmit = (values) => {
    categoryContext.submitCategoryForm(values)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFile(file)
    }
  }

  const handleDownloadTemplate = async () => {
    categoryContext.exportCategories({ ids: [] })
  }

  const onImport = async () => {
    const formData = new FormData()
    formData.append('file', file)
    categoryContext.importCategories(formData)
    setFile(null)
  }

  const loadCategoriesOptions = useCallback(async ({ query, selectedValue }) => {
    const response = await getCategories({
      pagination: { full: true },
      filters: {
        ...(selectedValue ? { ids: selectedValue } : { names: query }),
        active: [true],
        language: i18n.language,
      },
    })
    return response?.data?.categories || []
  }, [i18n.language])

  const isLoading = categoryContext.isLoading

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.categories.title')}</h2>
        <p className="text-muted-foreground">{t('page.categories.description')}</p>
      </div>
      <div className="flex items-center flex-wrap gap-2">
        <PermissionGate permission="category.import">
          <ImportButton
            handleFileChange={handleFileChange}
            handleDownloadTemplate={handleDownloadTemplate}
            isFileSelected={!!file}
            isLoading={isLoading}
            onSubmit={onImport}
          />
        </PermissionGate>
        <PermissionGate permission={['category.create']}>
          <Sheet open={categoryContext.isModalOpen} onOpenChange={() => !isLoading && categoryContext.toggleModal()}>
            <SheetTrigger asChild>
              <Button onClick={() => categoryContext.toggleModal()} disabled={isLoading}>
                <Plus />
                {t('page.categories.button.create')}
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-xl w-full overflow-y-auto" side="right">
              <SheetHeader>
                <SheetTitle>{t(`page.categories.form.title.${categoryContext.selectedCategory ? 'edit' : 'create'}`)}</SheetTitle>
                <SheetDescription>
                  {t(`page.categories.form.description.${categoryContext.selectedCategory ? 'edit' : 'create'}`)}
                </SheetDescription>
              </SheetHeader>
              <div className="w-full pb-4 px-4">
                <Form {...categoryContext.form}>
                  <form className="w-full space-y-4" onSubmit={categoryContext.form.handleSubmit(onSubmit)}>
                    {languages.map(language => (
                      <FormField
                        control={categoryContext.form.control}
                        key={language.code}
                        name={`names.${language.code}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t('page.categories.form.names', {
                                language: t(`language.${language.code}`),
                              })}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t('page.categories.form.names', {
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
                      control={categoryContext.form.control}
                      name="parent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('page.categories.form.parent')}</FormLabel>
                          <FormControl>
                            <AsyncSelect<Category>
                              fetcher={loadCategoriesOptions}
                              renderOption={e => e.names[i18n.language]}
                              getDisplayValue={e => e.names[i18n.language]}
                              getOptionValue={e => e.id}
                              width="100%"
                              className="w-full"
                              name="parent"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={categoryContext.form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('page.categories.form.priority')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={t('page.categories.form.priority')}
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
                      control={categoryContext.form.control}
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
                          <FormLabel>{t('page.categories.form.active')}</FormLabel>
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => categoryContext.toggleModal()}
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
