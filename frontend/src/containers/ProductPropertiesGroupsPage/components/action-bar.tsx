import { Plus } from 'lucide-react'

import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useRequestLanguages } from '@/api/hooks'
import { getProductProperties } from '@/api/requests'
import { AsyncSelect } from '@/components/AsyncSelect'
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
import { useProductPropertiesGroupsContext } from '@/contexts'

export function ActionBar() {
  const { t, i18n } = useTranslation()
  const productPropertiesGroupsContext = useProductPropertiesGroupsContext()

  const requestLanguages = useRequestLanguages({ pagination: { full: true } })
  const languages = requestLanguages?.data?.data?.languages || []

  const onSubmit = (values) => {
    productPropertiesGroupsContext.submitProductPropertyGroupForm(values)
  }

  const loadProductPropertiesOptions = useCallback(async ({ query, selectedValue }) => {
    const response = await getProductProperties({
      pagination: { full: true },
      filters: {
        ...(selectedValue ? { ids: selectedValue } : { names: query }),
        active: [true],
        language: i18n.language,
      },
    })
    return response?.data?.productProperties || []
  }, [i18n.language])

  const isLoading = productPropertiesGroupsContext.isLoading

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.product-properties-groups.title')}</h2>
        <p className="text-muted-foreground">{t('page.product-properties-groups.description')}</p>
      </div>
      <div className="flex items-center flex-wrap gap-2">

        <PermissionGate permission={['product-properties-groups.create']}>
          <Sheet open={productPropertiesGroupsContext.isModalOpen} onOpenChange={() => !isLoading && productPropertiesGroupsContext.toggleModal()}>
            <SheetTrigger asChild>
              <Button onClick={() => productPropertiesGroupsContext.toggleModal()} disabled={isLoading}>
                <Plus />
                {t('page.product-properties-groups.button.create')}
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-xl w-full overflow-y-auto" side="right">
              <SheetHeader>
                <SheetTitle>{t(`page.product-properties-groups.form.title.${productPropertiesGroupsContext.selectedProductPropertyGroup ? 'edit' : 'create'}`)}</SheetTitle>
                <SheetDescription>
                  {t(`page.product-properties-groups.form.description.${productPropertiesGroupsContext.selectedProductPropertyGroup ? 'edit' : 'create'}`)}
                </SheetDescription>
              </SheetHeader>
              <div className="w-full pb-4 px-4">
                <Form {...productPropertiesGroupsContext.form}>
                  <form className="w-full space-y-4" onSubmit={productPropertiesGroupsContext.form.handleSubmit(onSubmit)}>
                    {languages.map(language => (
                      <FormField
                        control={productPropertiesGroupsContext.form.control}
                        key={language.code}
                        name={`names.${language.code}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t('page.product-properties-groups.form.names', {
                                language: t(`language.${language.code}`),
                              })}
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
                      control={productPropertiesGroupsContext.form.control}
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
                      control={productPropertiesGroupsContext.form.control}
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
                    <FormField
                      control={productPropertiesGroupsContext.form.control}
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
                          <FormLabel>{t('page.product-properties-groups.form.active')}</FormLabel>
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => productPropertiesGroupsContext.toggleModal()}
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
