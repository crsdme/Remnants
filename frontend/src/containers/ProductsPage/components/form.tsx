import type { ProductPropertyDTO } from '@remnant/shared'
import type { ReactNode } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { ProductFormValues } from '../context'
import type { SupportedLanguage } from '@/utils/constants'
import { useWatch } from 'react-hook-form'
import {
  useCategoryOptions,
  useCurrencyQuery,
  useLanguageQuery,
  useProductPropertyGroupQuery,
  useSiteOptions,
  useUnitQuery,
} from '@/api/hooks'
import { useCategorySelectOptions } from '@/api/hooks/category/useCategorySelectOptions'
import { getProductPropertiesOptions } from '@/api/requests'
import { FileUploadDnd } from '@/components'
import { AsyncSelectMenu } from '@/components/AsyncSelectMenu'
import { AsyncSelectNew } from '@/components/AsyncSelectNew'
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
import { useLocale } from '@/utils/hooks'
import { useProductContext } from '../context'

export function ProductForm() {
  const { isEdit } = useProductContext()

  if (isEdit)
    return <EditForm />

  return (
    <CreateForm />
  )
}

function CreateForm() {
  const { t, language } = useLocale()
  const {
    isLoading,
    form,
    selectedGroup,
    setSelectedGroup,
    images,
    setImages,
    closeModal,
    getPropertiesDefaultValues,
    submitProductForm,
  } = useProductContext()

  const isAutoSyncEnabled = useWatch({
    control: form.control,
    name: 'isAutoSyncEnabled',
  })

  const loadSitesOptions = useSiteOptions()

  const { loadSearchOptions, loadSelectedOptions } = useCategorySelectOptions({
    defaultFilters: { active: [true], language },
  })

  const { languages } = useLanguageQuery({
    pagination: { full: true },
  })

  const { currencies } = useCurrencyQuery({
    pagination: { full: true },
    filters: { active: [true], language },
  })

  const { units } = useUnitQuery({
    pagination: { full: true },
    filters: { active: [true], language },
  })

  const { productPropertyGroups } = useProductPropertyGroupQuery({
    pagination: { full: true },
    filters: { active: [true], language },
  })

  return (
    <Form {...form}>
      <form
        className="w-full space-y-1"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit(submitProductForm)(e)
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
                      >
                        <FormControl>
                          <SelectTrigger className="w-[80px]">
                            <SelectValue placeholder="..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map(currency => (
                            <SelectItem key={currency.id} value={currency.id}>
                              {currency.symbols[language]}
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
                              {currency.symbols[language]}
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
              <AsyncSelectMenu
                loadSearchOptions={loadSearchOptions}
                loadSelectedOptions={loadSelectedOptions}
                onChange={field.onChange}
                field={field}
                value={field.value || []}
                renderOption={e => e.names[language]}
                getDisplayValue={e => e.names[language]}
                getOptionValue={e => e.id}
                triggerClassName="w-full"
                disabled={isLoading}
                searchable
                clearable
                multi
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
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('page.products.form.unit')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {units.map(unit => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.names[language]}
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
                    form.setValue('productProperties', getPropertiesDefaultValues(value, productPropertyGroups))
                    setSelectedGroup(value)
                  }}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('page.products.form.productPropertiesGroup')} />
                  </SelectTrigger>
                  <SelectContent>
                    {productPropertyGroups.map(group => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.names[language]}
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
            {(productPropertyGroups.find(group => group.id === selectedGroup)?.productProperties ?? []).map(
              (property): ReactNode => renderProductProperty({ property, form, isLoading, language }),
            )}
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

        <div className="flex gap-2 flex-wrap pb-2">
          <FormField
            control={form.control}
            name="isAutoSyncEnabled"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-md border p-4 grow">
                <div className="space-y-1">
                  <FormLabel className="text-sm">{t('page.products.form.isAutoSyncEnabled')}</FormLabel>
                  <FormDescription className="text-xs text-muted-foreground">
                    {t('page.products.form.isAutoSyncEnabled.description')}
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

        {!isAutoSyncEnabled && (
          <FormField
            control={form.control}
            name="syncSites"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('page.products.form.syncSites')}
                </FormLabel>
                <FormControl>
                  <AsyncSelectNew
                    {...field}
                    loadOptions={async ({ query = '', selectedValue } = {}) => loadSitesOptions({ query, selectedValue })}
                    renderOption={e => `${e.names[language]}`}
                    getDisplayValue={e => `${e.names[language]}`}
                    getOptionValue={e => e.id}
                    disabled={isLoading}
                    triggerClassName="flex-1"
                    searchable
                    clearable
                    multi
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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

function EditForm() {
  const { t, language } = useLocale()
  const {
    isLoading,
    form,
    selectedGroup,
    setSelectedGroup,
    images,
    setImages,
    closeModal,
    submitProductForm,
  } = useProductContext()

  const isAutoSyncEnabled = useWatch({
    control: form.control,
    name: 'isAutoSyncEnabled',
  })

  const loadSitesOptions = useSiteOptions()

  const loadCategoryOptions = useCategoryOptions({
    defaultFilters: { active: [true], language },
  })

  const { languages } = useLanguageQuery({
    pagination: { full: true },
  })

  const { currencies } = useCurrencyQuery({
    pagination: { full: true },
    filters: { active: [true], language },
  })

  const { units } = useUnitQuery({
    pagination: { full: true },
    filters: { active: [true], language },
  })

  const { productPropertyGroups } = useProductPropertyGroupQuery({
    pagination: { full: true },
    filters: { active: [true], language },
  })

  return (
    <Form {...form}>
      <form
        className="w-full"
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit(submitProductForm)(e)
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
                      >
                        <FormControl>
                          <SelectTrigger className="w-[80px]">
                            <SelectValue placeholder="..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map(currency => (
                            <SelectItem key={currency.id} value={currency.id}>
                              {currency.symbols[language]}
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
                              {currency.symbols[language]}
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
                <AsyncSelectNew
                  {...field}
                  loadOptions={loadCategoryOptions}
                  field={field}
                  value={field.value || []}
                  renderOption={e => e.names[language]}
                  getDisplayValue={e => e.names[language]}
                  getOptionValue={e => e.id}
                  triggerClassName="w-full"
                  searchable
                  clearable
                  multi
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
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {units.map(unit => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.names[language]}
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
                    {productPropertyGroups.map(group => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.names[language]}
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
            {(productPropertyGroups.find(group => group.id === selectedGroup)?.productProperties ?? []).map(
              (property): ReactNode => renderProductProperty({ property, form, isLoading, language }),
            )}
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
            name="isAutoSyncEnabled"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-md border p-4 grow">
                <div className="space-y-1">
                  <FormLabel className="text-sm">{t('page.products.form.isAutoSyncEnabled')}</FormLabel>
                  <FormDescription className="text-xs text-muted-foreground">
                    {t('page.products.form.isAutoSyncEnabled.description')}
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

        {!isAutoSyncEnabled && (
          <FormField
            control={form.control}
            name="syncSites"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('page.products.form.syncSites')}
                </FormLabel>
                <FormControl>
                  <AsyncSelectNew
                    {...field}
                    loadOptions={async ({ query = '', selectedValue } = {}) => loadSitesOptions({ query, selectedValue })}
                    renderOption={e => `${e.names[language]}`}
                    getDisplayValue={e => `${e.names[language]}`}
                    getOptionValue={e => e.id}
                    disabled={isLoading}
                    triggerClassName="flex-1"
                    searchable
                    clearable
                    multi
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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

function renderProductProperty({ property, form, isLoading, language }: {
  property: ProductPropertyDTO
  form: UseFormReturn<ProductFormValues>
  isLoading: boolean
  language: SupportedLanguage
}) {
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
                  {property.names[language]}
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
                  {property.names[language]}
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
                  {property.names[language]}
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
                  {property.names[language]}
                  {property.isRequired && <span className="text-destructive ml-1">*</span>}
                </p>
              </FormLabel>
              <AsyncSelectNew
                {...field}
                loadOptions={async ({ query = '', selectedValue } = {}) => {
                  const response = await getProductPropertiesOptions({
                    pagination: { full: true },
                    filters: {
                      ...(selectedValue ? { ids: selectedValue } : { names: query }),
                      productProperty: property.id,
                      active: [true],
                      language,
                    },
                  })
                  return response?.data?.data?.items || []
                }}
                field={field}
                value={field.value || []}
                renderOption={e => e.names[language]}
                getDisplayValue={e => e.names[language]}
                getOptionValue={e => e.id}
                triggerClassName="w-full"
                disabled={isLoading}
                searchable
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
                  {property.names[language]}
                  {property.isRequired && <span className="text-destructive ml-1">*</span>}
                </p>
              </FormLabel>
              <AsyncSelectNew
                {...field}
                loadOptions={async ({ query = '', selectedValue } = {}) => {
                  const response = await getProductPropertiesOptions({
                    pagination: { full: true },
                    filters: {
                      ...(selectedValue ? { ids: selectedValue } : { names: query }),
                      productProperty: property.id,
                      active: [true],
                      language,
                    },
                  })
                  return response?.data?.data?.items || []
                }}
                field={field}
                value={field.value || []}
                renderOption={e => e.names[language]}
                getDisplayValue={e => e.names[language]}
                getOptionValue={e => e.id}
                triggerClassName="w-full"
                searchable
                clearable
                multi
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
                  {property.names[language]}
                  {property.isRequired && <span className="text-destructive ml-1">*</span>}
                </p>
              </FormLabel>
              <AsyncSelectNew
                {...field}
                loadOptions={async ({ query = '', selectedValue } = {}) => {
                  const response = await getProductPropertiesOptions({
                    pagination: { full: true },
                    filters: {
                      ...(selectedValue ? { ids: selectedValue } : { names: query }),
                      productProperty: property.id,
                      active: [true],
                      language,
                    },
                  })
                  return response?.data?.data?.items || []
                }}
                renderOption={e => (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: e.color }} />
                    {e.names[language]}
                  </div>
                )}
                getDisplayValue={e => (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: e.color }} />
                    {e.names[language]}
                  </div>
                )}
                field={field}
                value={field.value || []}
                getOptionValue={e => e.id}
                triggerClassName="w-full"
                disabled={isLoading}
                searchable
              />
            </FormItem>
          )}
        />
      )
  }
}
