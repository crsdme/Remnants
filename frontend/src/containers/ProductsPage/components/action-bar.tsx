import { Plus } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useRequestCurrencies, useRequestLanguages, useRequestProductPropertiesGroups } from '@/api/hooks'
import { getCategories, getProductPropertiesOptions, getUnits } from '@/api/requests'
import { AsyncSelect, FileUploadDnd, ImportButton, PermissionGate } from '@/components'
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Switch,
} from '@/components/ui'
import { useProductContext } from '@/contexts'

export function ActionBar() {
  const { t, i18n } = useTranslation()
  const productContext = useProductContext()
  const [file, setFile] = useState<File | null>(null)

  const requestLanguages = useRequestLanguages({ pagination: { full: true } })
  const languages = requestLanguages?.data?.data?.languages || []

  const requestCurrencies = useRequestCurrencies({ pagination: { full: true }, filters: { active: [true], language: i18n.language } })
  const currencies = requestCurrencies?.data?.data?.currencies || []

  const requestProductPropertiesGroups = useRequestProductPropertiesGroups({ pagination: { full: true }, filters: { active: [true], language: i18n.language } })
  const productPropertiesGroups = requestProductPropertiesGroups?.data?.data?.productPropertyGroups || []

  const onSubmit = (value) => {
    productContext.submitProductForm(value)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFile(file)
    }
  }

  const handleDownloadTemplate = async () => {
    productContext.exportProducts({ ids: [] })
  }

  const onImport = async () => {
    const formData = new FormData()
    formData.append('file', file)
    productContext.importProducts(formData)
    setFile(null)
  }

  const loadCategoryOptions = useCallback(async ({ query, selectedValue }) => {
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

  const loadUnitsOptions = useCallback(async ({ query, selectedValue }) => {
    const response = await getUnits({
      pagination: { full: true },
      filters: {
        ...(selectedValue ? { ids: selectedValue } : { names: query }),
        active: [true],
        language: i18n.language,
      },
    })
    return response?.data?.units || []
  }, [i18n.language])

  const isLoading = productContext.isLoading

  const renderProductProperty = (property) => {
    const type = property.type

    switch (type) {
      case 'text':
        return (
          <FormField
            control={productContext.form.control}
            name={`productProperties.${property.id}`}
            key={property.id}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{property.names[i18n.language]}</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    value={field.value}
                    onChange={e => field.onChange(e.target.value)}
                    disabled={isLoading}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )
      case 'number':
        return (
          <FormField
            control={productContext.form.control}
            name={`productProperties.${property.id}`}
            key={property.id}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{property.names[i18n.language]}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value}
                    onChange={e => field.onChange(Number(e.target.value))}
                    disabled={isLoading}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )
      case 'boolean':
        return (
          <FormField
            control={productContext.form.control}
            name={`productProperties.${property.id}`}
            key={property.id}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{property.names[i18n.language]}</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )
      case 'select':
        return (
          <FormField
            control={productContext.form.control}
            name={`productProperties.${property.id}`}
            key={property.id}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{property.names[i18n.language]}</FormLabel>
                <FormControl>
                  <AsyncSelect
                    fetcher={async ({ query, selectedValue }) => {
                      const response = await getProductPropertiesOptions({
                        pagination: { full: true },
                        filters: {
                          ...(selectedValue ? { ids: selectedValue } : { names: query }),
                          productProperty: property.id,
                          active: [true],
                          language: i18n.language,
                        },
                      })
                      return response?.data?.productPropertiesOptions || []
                    }}
                    renderOption={e => e.names[i18n.language]}
                    getDisplayValue={e => e.names[i18n.language]}
                    getOptionValue={e => e.id}
                    width="100%"
                    className="w-full"
                    name="categories"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      case 'multiSelect':
        return (
          <FormField
            control={productContext.form.control}
            name={`productProperties.${property.id}`}
            key={property.id}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{property.names[i18n.language]}</FormLabel>
                <FormControl>
                  <AsyncSelect
                    fetcher={async ({ query, selectedValue }) => {
                      const response = await getProductPropertiesOptions({
                        pagination: { full: true },
                        filters: {
                          ...(selectedValue ? { ids: selectedValue } : { names: query }),
                          productProperty: property.id,
                          active: [true],
                          language: i18n.language,
                        },
                      })
                      return response?.data?.productPropertiesOptions || []
                    }}
                    renderOption={e => e.names[i18n.language]}
                    getDisplayValue={e => e.names[i18n.language]}
                    getOptionValue={e => e.id}
                    width="100%"
                    className="w-full"
                    name="categories"
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
        )
      case 'color':
        return (
          <FormField
            control={productContext.form.control}
            name={`productProperties.${property.id}`}
            key={property.id}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{property.names[i18n.language]}</FormLabel>
                <FormControl>
                  <AsyncSelect
                    fetcher={async ({ query, selectedValue }) => {
                      const response = await getProductPropertiesOptions({
                        pagination: { full: true },
                        filters: {
                          ...(selectedValue ? { ids: selectedValue } : { names: query }),
                          productProperty: property.id,
                          active: [true],
                          language: i18n.language,
                        },
                      })
                      return response?.data?.productPropertiesOptions || []
                    }}
                    renderOption={e => (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: e.color }} />
                        {e.names[i18n.language]}
                      </div>
                    )}
                    getDisplayValue={e => (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: e.color }} />
                        {e.names[i18n.language]}
                      </div>
                    )}
                    getOptionValue={e => e.id}
                    width="100%"
                    className="w-full"
                    name="categories"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
    }
  }

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.products.title')}</h2>
        <p className="text-muted-foreground">{t('page.products.description')}</p>
      </div>
      <div className="flex items-center flex-wrap gap-2">
        <PermissionGate permission="product.import">
          <ImportButton
            handleFileChange={handleFileChange}
            handleDownloadTemplate={handleDownloadTemplate}
            isFileSelected={!!file}
            isLoading={isLoading}
            onSubmit={onImport}
          />
        </PermissionGate>
        <PermissionGate permission={['product.create']}>
          <Sheet open={productContext.isModalOpen} onOpenChange={() => !isLoading && productContext.toggleModal()}>
            <SheetTrigger asChild>
              <Button onClick={() => productContext.toggleModal()} disabled={isLoading}>
                <Plus />
                {t('page.products.button.create')}
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-xl w-full overflow-y-auto" side="right">
              <SheetHeader>
                <SheetTitle>{t(`page.products.form.title.${productContext.selectedProduct ? 'edit' : 'create'}`)}</SheetTitle>
                <SheetDescription>
                  {t(`page.products.form.description.${productContext.selectedProduct ? 'edit' : 'create'}`)}
                </SheetDescription>
              </SheetHeader>
              <div className="w-full pb-4 px-4">
                <Form {...productContext.form}>
                  <form
                    className="w-full space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault()
                      productContext.form.handleSubmit(onSubmit)(e)
                    }}
                  >
                    {languages.map(language => (
                      <FormField
                        control={productContext.form.control}
                        key={language.code}
                        name={`names.${language.code}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t('page.products.form.names', {
                                language: t(`language.${language.code}`),
                              })}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t('page.products.form.names', {
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

                    <div className="flex gap-2">
                      <FormField
                        control={productContext.form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('page.products.form.price')}</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  placeholder={t('page.products.form.price')}
                                  className="w-full"
                                  {...field}
                                  disabled={isLoading}
                                  onChange={e => field.onChange(Number(e.target.value))}
                                />
                                <FormField
                                  control={productContext.form.control}
                                  name="currency"
                                  render={({ field: currencyField }) => (
                                    <Select
                                      value={currencyField.value}
                                      onValueChange={currencyField.onChange}
                                      disabled={isLoading}
                                    >
                                      <SelectTrigger className="w-[80px]">
                                        <SelectValue placeholder="..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {currencies.map(currency => (
                                          <SelectItem key={currency.id} value={currency.id}>
                                            {currency.symbols[i18n.language]}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={productContext.form.control}
                        name="purchasePrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('page.products.form.purchasePrice')}</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  placeholder={t('page.products.form.purchasePrice')}
                                  className="w-full"
                                  {...field}
                                  disabled={isLoading}
                                  onChange={e => field.onChange(Number(e.target.value))}
                                />
                                <FormField
                                  control={productContext.form.control}
                                  name="purchaseCurrency"
                                  render={({ field: currencyField }) => (
                                    <Select
                                      value={currencyField.value}
                                      onValueChange={currencyField.onChange}
                                      disabled={isLoading}
                                    >
                                      <SelectTrigger className="w-[80px]">
                                        <SelectValue placeholder="..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {currencies.map(currency => (
                                          <SelectItem key={currency.id} value={currency.id}>
                                            {currency.symbols[i18n.language]}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={productContext.form.control}
                      name="categories"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('page.products.form.categories')}</FormLabel>
                          <FormControl>
                            <AsyncSelect
                              fetcher={loadCategoryOptions}
                              renderOption={e => e.names[i18n.language]}
                              getDisplayValue={e => e.names[i18n.language]}
                              getOptionValue={e => e.id}
                              width="100%"
                              className="w-full"
                              name="categories"
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
                      control={productContext.form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('page.products.form.unit')}</FormLabel>
                          <FormControl>
                            <AsyncSelect
                              fetcher={loadUnitsOptions}
                              renderOption={e => e.names[i18n.language]}
                              getDisplayValue={e => e.names[i18n.language]}
                              getOptionValue={e => e.id}
                              width="100%"
                              className="w-full"
                              name="unit"
                              value={field.value}
                              onChange={field.onChange}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator />

                    <FormField
                      control={productContext.form.control}
                      name="productPropertiesGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('page.products.form.productPropertiesGroup')}</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value)
                                productContext.setSelectedGroup(value)
                              }}
                              disabled={isLoading}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="..." />
                              </SelectTrigger>
                              <SelectContent>
                                {productPropertiesGroups.map(group => (
                                  <SelectItem key={group.id} value={group.id}>
                                    {group.names[i18n.language]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {productContext.selectedGroup && (
                      <>
                        <Separator />
                        {(productPropertiesGroups.find(group => group.id === productContext.selectedGroup)?.productProperties || []).map(property => (
                          renderProductProperty(property)
                        ))}
                        <Separator />
                      </>
                    )}

                    <FormField
                      control={productContext.form.control}
                      name="images"
                      render={() => (
                        <FormItem>
                          <FormLabel>{t('page.products.form.images')}</FormLabel>
                          <FormControl>
                            <FileUploadDnd disabled={isLoading} files={productContext.images} setFiles={productContext.setImages} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => productContext.toggleModal()}
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
