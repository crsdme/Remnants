import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useRequestLanguages } from '@/api/hooks'
import { getCategories } from '@/api/requests'
import { AsyncSelect } from '@/components'
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
import { useCategoryContext } from '@/contexts'

export function CategoryForm() {
  const categoryContext = useCategoryContext()

  const { isLoading, isEdit, form } = categoryContext

  const requestLanguages = useRequestLanguages({ pagination: { full: true } })
  const languages = requestLanguages?.data?.data?.languages || []

  const onSubmit = (values) => {
    categoryContext.submitCategoryForm(values)
  }

  if (isEdit)
    return <EditForm form={form} languages={languages} isLoading={isLoading} onSubmit={onSubmit} categoryContext={categoryContext} />

  return <CreateForm form={form} languages={languages} isLoading={isLoading} onSubmit={onSubmit} categoryContext={categoryContext} />
}

function CreateForm({ form, languages, isLoading, onSubmit, categoryContext }) {
  const { t, i18n } = useTranslation()

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

  return (
    <Form {...form}>
      <form className="w-full space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        {languages.map(language => (
          <FormField
            control={form.control}
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
          control={form.control}
          name="parent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.categories.form.parent')}</FormLabel>
              <FormControl>
                <AsyncSelect
                  fetcher={loadCategoriesOptions}
                  renderOption={e => e.names[i18n.language]}
                  getDisplayValue={e => e.names[i18n.language]}
                  getOptionValue={e => e.id}
                  width="100%"
                  className="w-full"
                  name="parent"
                  value={field.value}
                  onChange={field.onChange}
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
  )
}

function EditForm({ form, languages, isLoading, onSubmit, categoryContext }) {
  const { t, i18n } = useTranslation()

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

  return (
    <Form {...form}>
      <form className="w-full space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        {languages.map(language => (
          <FormField
            control={form.control}
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
          control={form.control}
          name="parent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.categories.form.parent')}</FormLabel>
              <FormControl>
                <AsyncSelect
                  fetcher={loadCategoriesOptions}
                  renderOption={e => e.names[i18n.language]}
                  getDisplayValue={e => e.names[i18n.language]}
                  getOptionValue={e => e.id}
                  width="100%"
                  className="w-full"
                  name="parent"
                  value={field.value}
                  onChange={field.onChange}
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
  )
}
