import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useLanguageQuery, useProductPropertyOptions } from '@/api/hooks'
import { AsyncSelect, PermissionGate } from '@/components'
import {
  Button,
  Checkbox,
  Form,
  FormControl,
  FormDescription,
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
import { useProductPropertiesGroupsContext } from '@/contexts'

export function ActionBar() {
  const { t, i18n } = useTranslation()
  const { isLoading, isEdit, form, submitGroupForm, openModal, closeModal, isModalOpen } = useProductPropertiesGroupsContext()

  const requestLanguages = useLanguageQuery({ pagination: { full: true } })
  const languages = requestLanguages?.data?.data?.languages || []

  const onSubmit = (values) => {
    submitGroupForm(values)
  }

  const loadProductPropertiesOptions = useProductPropertyOptions()

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.product-properties-groups.title')}</h2>
        <p className="text-muted-foreground">{t('page.product-properties-groups.description')}</p>
      </div>
      <div className="flex items-center flex-wrap gap-2">

        <PermissionGate permission={['product-properties-groups.create']}>
          <Sheet open={isModalOpen} onOpenChange={closeModal}>
            <SheetTrigger asChild>
              <Button onClick={() => openModal()} disabled={isLoading}>
                <Plus />
                {t('page.product-properties-groups.button.create')}
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-xl w-full overflow-y-auto" side="right">
              <SheetHeader>
                <SheetTitle>{t(`page.product-properties-groups.form.title.${isEdit ? 'edit' : 'create'}`)}</SheetTitle>
                <SheetDescription>
                  {t(`page.product-properties-groups.form.description.${isEdit ? 'edit' : 'create'}`)}
                </SheetDescription>
              </SheetHeader>
              <div className="w-full pb-4 px-4">
                <Form {...form}>
                  <form className="w-full space-y-1" onSubmit={form.handleSubmit(onSubmit)}>
                    {languages.map(language => (
                      <FormField
                        control={form.control}
                        key={language.code}
                        name={`names.${language.code}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              <p>
                                {t('page.product-properties-groups.form.names', {
                                  language: t(`language.${language.code}`),
                                })}
                                <span className="text-destructive ml-1">*</span>
                              </p>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t('page.product-properties-groups.form.names', {
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
                      name="productProperties"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('page.product-properties-groups.form.productProperties')}</FormLabel>
                          <FormControl>
                            <AsyncSelect
                              fetcher={loadProductPropertiesOptions}
                              renderOption={e => e.names[i18n.language]}
                              getDisplayValue={e => e.names[i18n.language]}
                              getOptionValue={e => e.id}
                              width="100%"
                              className="w-full"
                              name="productProperties"
                              value={field.value}
                              onChange={field.onChange}
                              multi
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
                          <FormLabel>{t('page.product-properties-groups.form.priority')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={t('page.product-properties-groups.form.priority')}
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
                    <div className="flex gap-2 flex-wrap pb-2">
                      <FormField
                        control={form.control}
                        name="active"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-md border p-4 grow">
                            <div className="space-y-1">
                              <FormLabel className="text-sm">{t('page.product-properties-groups.form.active')}</FormLabel>
                              <FormDescription className="text-xs text-muted-foreground">
                                {t('page.product-properties-groups.form.active.description')}
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isLoading}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={closeModal}
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
