import { Plus } from 'lucide-react'

import { useTranslation } from 'react-i18next'
import { useRequestLanguages } from '@/api/hooks'
import { ColorPicker } from '@/components/ColorPicker'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useProductPropertiesContext } from '@/contexts'

export function ActionBar() {
  const { t } = useTranslation()
  const productPropertiesContext = useProductPropertiesContext()

  const requestLanguages = useRequestLanguages({ pagination: { full: true } })
  const languages = requestLanguages?.data?.data?.languages || []

  const onSubmit = (values) => {
    productPropertiesContext.submitProductPropertyForm(values)
  }

  const onSubmitOptions = (values) => {
    productPropertiesContext.submitOptionsForm(values)
  }

  const isLoading = productPropertiesContext.isLoading

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.product-properties.title')}</h2>
        <p className="text-muted-foreground">{t('page.product-properties.description')}</p>
      </div>
      <div className="flex items-center flex-wrap gap-2">

        <PermissionGate permission={['product-properties-options.create']}>
          <Sheet open={productPropertiesContext.isOptionsModalOpen} onOpenChange={() => !isLoading && productPropertiesContext.toggleOptionsModal()}>
            <SheetContent className="sm:max-w-xl w-full overflow-y-auto" side="right">
              <SheetHeader>
                <SheetTitle>{t('page.product-properties.form.title.createOption')}</SheetTitle>
                <SheetDescription>
                  {t('page.product-properties.form.description.createOption')}
                </SheetDescription>
              </SheetHeader>
              <div className="w-full p-4">
                <Form {...productPropertiesContext.optionsForm}>
                  <form className="w-full space-y-4" onSubmit={productPropertiesContext.optionsForm.handleSubmit(onSubmitOptions)}>
                    {languages.map(language => (
                      <FormField
                        control={productPropertiesContext.optionsForm.control}
                        key={language.code}
                        name={`names.${language.code}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t('page.product-properties.form.names', {
                                language: t(`language.${language.code}`),
                              })}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t('page.product-properties.form.names', {
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
                      control={productPropertiesContext.optionsForm.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('page.product-properties.form.priority')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={t('page.product-properties.form.priority')}
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
                      control={productPropertiesContext.optionsForm.control}
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
                          <FormLabel>{t('page.product-properties.form.active')}</FormLabel>
                        </FormItem>
                      )}
                    />

                    {productPropertiesContext?.selectedProductProperty?.type === 'color'
                      && (
                        <FormField
                          control={productPropertiesContext.optionsForm.control}
                          name="color"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <ColorPicker
                                  value={field.value}
                                  onChange={field.onChange}
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormLabel>{t('page.product-properties.form.color')}</FormLabel>
                            </FormItem>
                          )}
                        />
                      )}

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => productPropertiesContext.toggleOptionsModal()}
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

        <PermissionGate permission={['product-properties.create']}>
          <Sheet open={productPropertiesContext.isModalOpen} onOpenChange={() => !isLoading && productPropertiesContext.toggleModal()}>
            <SheetTrigger asChild>
              <Button onClick={() => productPropertiesContext.toggleModal()} disabled={isLoading}>
                <Plus />
                {t('page.product-properties.button.create')}
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-xl w-full overflow-y-auto" side="right">
              <SheetHeader>
                <SheetTitle>{t('page.product-properties.form.title.create')}</SheetTitle>
                <SheetDescription>
                  {t('page.product-properties.form.description.create')}
                </SheetDescription>
              </SheetHeader>
              <div className="w-full p-4">
                <Form {...productPropertiesContext.form}>
                  <form className="w-full space-y-4" onSubmit={productPropertiesContext.form.handleSubmit(onSubmit)}>
                    {languages.map(language => (
                      <FormField
                        control={productPropertiesContext.form.control}
                        key={language.code}
                        name={`names.${language.code}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t('page.product-properties.form.names', {
                                language: t(`language.${language.code}`),
                              })}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t('page.product-properties.form.names', {
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
                      control={productPropertiesContext.form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('page.product-properties.form.type')}</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              disabled={isLoading}
                              {...field}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder={t('page.product-properties.form.type')} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">{t('page.product-properties.type.text')}</SelectItem>
                                <SelectItem value="number">{t('page.product-properties.type.number')}</SelectItem>
                                <SelectItem value="boolean">{t('page.product-properties.type.boolean')}</SelectItem>
                                <SelectItem value="color">{t('page.product-properties.type.color')}</SelectItem>
                                <SelectItem value="select">{t('page.product-properties.type.select')}</SelectItem>
                                <SelectItem value="multiSelect">{t('page.product-properties.type.multiSelect')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productPropertiesContext.form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('page.product-properties.form.priority')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={t('page.product-properties.form.priority')}
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
                      control={productPropertiesContext.form.control}
                      name="isRequired"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormLabel>{t('page.product-properties.form.isRequired')}</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productPropertiesContext.form.control}
                      name="showInTable"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormLabel>{t('page.product-properties.form.showInTable')}</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productPropertiesContext.form.control}
                      name="active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormLabel>{t('page.product-properties.form.active')}</FormLabel>
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => productPropertiesContext.toggleModal()}
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
