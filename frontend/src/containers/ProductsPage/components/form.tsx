import { useTranslation } from 'react-i18next'
import { useCurrencyQuery, useLanguageQuery, useProductPropertyGroupQuery, useUnitQuery } from '@/api/hooks'
import { getProductPropertiesOptions } from '@/api/requests'
import { AsyncSelect, FileUploadDnd } from '@/components'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@/components/ui'
import { useProductContext } from '@/contexts'

export function ProductForm() {
  const { i18n } = useTranslation()
  const { isLoading, isEdit, form, submitProductForm } = useProductContext()

  const requestLanguages = useLanguageQuery({ pagination: { full: true } })
  const languages = requestLanguages?.data?.data?.languages || []

  const requestCurrencies = useCurrencyQuery({ pagination: { full: true }, filters: { active: [true], language: i18n.language } })
  const currencies = requestCurrencies?.data?.data?.currencies || []

  const requestUnits = useUnitQuery({ pagination: { full: true }, filters: { active: [true], language: i18n.language } })
  const units = requestUnits?.data?.data?.units || []

  const requestProductPropertiesGroups = useProductPropertyGroupQuery({ pagination: { full: true }, filters: { active: [true], language: i18n.language } })
  const productPropertiesGroups = requestProductPropertiesGroups?.data?.data?.productPropertyGroups || []

  const onSubmit = (values) => {
    submitProductForm(values)
  }

  const renderProductProperty = (property) => {
    switch (property.type) {
      case 'text':
        return (
          <FormField
            control={form.control}
            name={`productProperties.${property.id}`}
            key={property.id}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <p>
                    {property.names[i18n.language]}
                    {property.isRequired && <span className="text-destructive ml-1">*</span>}
                  </p>
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    value={field.value || ''}
                    onChange={e => field.onChange(e.target.value)}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      case 'number':
        return (
          <FormField
            control={form.control}
            name={`productProperties.${property.id}`}
            key={property.id}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <p>
                    {property.names[i18n.language]}
                    {property.isRequired && <span className="text-destructive ml-1">*</span>}
                  </p>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value || 0}
                    onChange={e => field.onChange(Number(e.target.value))}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      case 'boolean':
        return (
          <FormField
            control={form.control}
            name={`productProperties.${property.id}`}
            key={property.id}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <p>
                    {property.names[i18n.language]}
                    {property.isRequired && <span className="text-destructive ml-1">*</span>}
                  </p>
                </FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      case 'select':
        return (
          <FormField
            control={form.control}
            name={`productProperties.${property.id}`}
            key={property.id}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <p>
                    {property.names[i18n.language]}
                    {property.isRequired && <span className="text-destructive ml-1">*</span>}
                  </p>
                </FormLabel>
                <AsyncSelect
                  fetcher={async ({ query, selectedValue }) => {
                    const response = await getProductPropertiesOptions({
                      pagination: { full: true },
                      filters: {
                        ...(selectedValue ? { ids: [selectedValue] } : { names: query }),
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
                  value={field.value || []}
                  onChange={field.onChange}
                  disabled={isLoading}
                />
              </FormItem>
            )}
          />
        )
      case 'multiSelect':
        return (
          <FormField
            control={form.control}
            name={`productProperties.${property.id}`}
            key={property.id}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <p>
                    {property.names[i18n.language]}
                    {property.isRequired && <span className="text-destructive ml-1">*</span>}
                  </p>
                </FormLabel>
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
                  value={field.value || []}
                  onChange={field.onChange}
                  multi
                  disabled={isLoading}
                />
              </FormItem>
            )}
          />
        )
      case 'color':
        return (
          <FormField
            control={form.control}
            name={`productProperties.${property.id}`}
            key={property.id}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <p>
                    {property.names[i18n.language]}
                    {property.isRequired && <span className="text-destructive ml-1">*</span>}
                  </p>
                </FormLabel>
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
                  field={field}
                />
              </FormItem>
            )}
          />
        )
    }
  }

  if (isEdit) {
    return (
      <EditForm
        languages={languages}
        currencies={currencies}
        units={units}
        productPropertiesGroups={productPropertiesGroups}
        onSubmit={onSubmit}
        renderProductProperty={renderProductProperty}
      />
    )
  }

  return (
    <CreateForm
      languages={languages}
      currencies={currencies}
      units={units}
      productPropertiesGroups={productPropertiesGroups}
      onSubmit={onSubmit}
      renderProductProperty={renderProductProperty}
    />
  )
}

function CreateForm({ languages, currencies, units, productPropertiesGroups, onSubmit, renderProductProperty }) {
  const { t, i18n } = useTranslation()
  const {
    isLoading,
    form,
    selectedGroup,
    setSelectedGroup,
    images,
    setImages,
    closeModal,
    loadCategoryOptions,
    getPropertiesDefaultValues,
  } = useProductContext()

  return (
    <Form {...form}>
      <form
        className="w-full space-y-1"
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit(onSubmit)(e)
        }}
      >
        {languages.map(language => (
          <FormField
            control={form.control}
            key={language.code}
            name={`names.${language.code}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <p>
                    {t('page.products.form.names', {
                      language: t(`language.${language.code}`),
                    })}
                    <span className="text-destructive ml-1">*</span>
                  </p>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('page.products.form.names', {
                      language: t(`language.${language.code}`),
                    })}
                    className="w-full"
                    {...field}
                    value={field.value || ''}
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
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <p>
                    {t('page.products.form.price')}
                    <span className="text-destructive ml-1">*</span>
                  </p>
                </FormLabel>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t('page.products.form.price')}
                      className="w-full"
                      {...field}
                      disabled={isLoading}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field: currencyField }) => (
                      <Select
                        value={currencyField.value}
                        onValueChange={currencyField.onChange}
                        disabled={isLoading}
                        {...currencyField}
                      >
                        <FormControl>
                          <SelectTrigger className="w-[80px]">
                            <SelectValue placeholder="..." />
                          </SelectTrigger>
                        </FormControl>
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('page.products.form.purchasePrice')}</FormLabel>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t('page.products.form.purchasePrice')}
                      className="w-full"
                      {...field}
                      disabled={isLoading}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormField
                    control={form.control}
                    name="purchaseCurrency"
                    render={({ field: currencyField }) => (
                      <Select
                        value={currencyField.value}
                        onValueChange={currencyField.onChange}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="w-[80px]">
                            <SelectValue placeholder="..." />
                          </SelectTrigger>
                        </FormControl>
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
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="categories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <p>
                  {t('page.products.form.categories')}
                  <span className="text-destructive ml-1">*</span>
                </p>
              </FormLabel>
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
                field={field}
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <p>
                  {t('page.products.form.unit')}
                  <span className="text-destructive ml-1">*</span>
                </p>
              </FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isLoading}
                {...field}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('page.products.form.unit')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {units.map(unit => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.names[i18n.language]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="productPropertiesGroup"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.products.form.productPropertiesGroup')}</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value)
                    form.setValue('productProperties', getPropertiesDefaultValues(value, productPropertiesGroups))
                    setSelectedGroup(value)
                  }}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('page.products.form.productPropertiesGroup')} />
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

        {selectedGroup && (
          <div>
            {(productPropertiesGroups.find(group => group.id === selectedGroup)?.productProperties || []).map(property => (
              renderProductProperty(property)
            ))}
          </div>
        )}

        <FormField
          control={form.control}
          name="images"
          render={() => (
            <FormItem>
              <FormLabel>{t('page.products.form.images')}</FormLabel>
              <FormControl>
                <FileUploadDnd isLoading={isLoading} files={images} setFiles={setImages} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 flex-wrap pb-2">
          <FormField
            control={form.control}
            name="generateBarcode"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-md border p-4 grow">
                <div className="space-y-1">
                  <FormLabel className="text-sm">{t('page.products.form.generateBarcode')}</FormLabel>
                  <FormDescription className="text-xs text-muted-foreground">
                    {t('page.products.form.generateBarcode.description')}
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
            onClick={() => closeModal()}
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

function EditForm({ languages, currencies, units, productPropertiesGroups, onSubmit, renderProductProperty }) {
  const { t, i18n } = useTranslation()
  const {
    isLoading,
    form,
    selectedGroup,
    setSelectedGroup,
    images,
    setImages,
    closeModal,
    loadCategoryOptions,
  } = useProductContext()

  return (
    <Form {...form}>
      <form
        className="w-full"
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit(onSubmit)(e)
        }}
      >
        {languages.map(language => (
          <FormField
            control={form.control}
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
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('page.products.form.price')}</FormLabel>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t('page.products.form.price')}
                      className="w-full"
                      {...field}
                      disabled={isLoading}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field: currencyField }) => (
                      <Select
                        value={currencyField.value}
                        onValueChange={currencyField.onChange}
                        disabled={isLoading}
                        {...currencyField}
                      >
                        <FormControl>
                          <SelectTrigger className="w-[80px]">
                            <SelectValue placeholder="..." />
                          </SelectTrigger>
                        </FormControl>
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('page.products.form.purchasePrice')}</FormLabel>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t('page.products.form.purchasePrice')}
                      className="w-full"
                      {...field}
                      disabled={isLoading}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormField
                    control={form.control}
                    name="purchaseCurrency"
                    render={({ field: currencyField }) => (
                      <Select
                        value={currencyField.value}
                        onValueChange={currencyField.onChange}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="w-[80px]">
                            <SelectValue placeholder="..." />
                          </SelectTrigger>
                        </FormControl>
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
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
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
                  field={field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.products.form.unit')}</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isLoading}
                {...field}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {units.map(unit => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.names[i18n.language]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="productPropertiesGroup"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.products.form.productPropertiesGroup')}</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value)
                    setSelectedGroup(value)
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

        {selectedGroup && (
          <div className="space-y-2">
            {(productPropertiesGroups.find(group => group.id === selectedGroup)?.productProperties || []).map(property => (
              renderProductProperty(property)
            ))}
          </div>
        )}

        <FormField
          control={form.control}
          name="images"
          render={() => (
            <FormItem>
              <FormLabel>{t('page.products.form.images')}</FormLabel>
              <FormControl>
                <FileUploadDnd isLoading={isLoading} files={images} setFiles={setImages} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => closeModal()}
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
