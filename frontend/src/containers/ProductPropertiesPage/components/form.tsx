import { useWatch } from 'react-hook-form'
import { useLanguageQuery } from '@/api/hooks'
import { ColorPicker } from '@/components'
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
} from '@/components/ui'
import { useLocale } from '@/utils/hooks'
import { useProductPropertiesContext } from '../context'

export function ProductOptionForm() {
  const { t } = useLocale()
  const { optionForm, isLoading, submitOptionsForm, closeOptionsModal, selectedProperty } = useProductPropertiesContext()

  const { languages = [] } = useLanguageQuery(
    { pagination: { full: true } },
    { options: { placeholderData: prevData => prevData } },
  )

  return (
    <Form {...optionForm}>
      <form className="w-full space-y-1" onSubmit={e => void optionForm.handleSubmit(submitOptionsForm)(e)}>
        {languages.map(language => (
          <FormField
            control={optionForm.control}
            key={language.code}
            name={`names.${language.code}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <p>
                    {t('page.product-properties.form.names', {
                      language: t(`language.${language.code}`),
                    })}
                    <span className="text-destructive ml-1">*</span>
                  </p>
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
          control={optionForm.control}
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

        <div className="flex gap-2 flex-wrap pb-2">
          <FormField
            control={optionForm.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-md border p-4 grow">
                <div className="space-y-1">
                  <FormLabel className="text-sm">{t('page.product-properties.form.active')}</FormLabel>
                  <FormDescription className="text-xs text-muted-foreground">
                    {t('page.product-properties.form.active.description')}
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

        {selectedProperty?.type === 'color'
          && (
            <FormField
              control={optionForm.control}
              name="color"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <ColorPicker
                      ref={field.ref}
                      value={field.value || ''}
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
            onClick={closeOptionsModal}
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

export function ProductPropertyForm() {
  const { t } = useLocale()
  const { propertyForm, isLoading, submitProductPropertyForm, closePropertyModal } = useProductPropertiesContext()

  const isTextOrNumber = ['text', 'number'].includes(useWatch({ control: propertyForm.control, name: 'type' }))

  const { languages = [] } = useLanguageQuery(
    { pagination: { full: true } },
    { options: { placeholderData: prevData => prevData } },
  )

  return (
    <Form {...propertyForm}>
      <form
        className="w-full space-y-1"
        onSubmit={e => void propertyForm.handleSubmit(submitProductPropertyForm)(e)}
      >
        {languages.map(language => (
          <FormField
            control={propertyForm.control}
            key={language.code}
            name={`names.${language.code}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <p>
                    {t('page.product-properties.form.names', {
                      language: t(`language.${language.code}`),
                    })}
                    <span className="text-destructive ml-1">*</span>
                  </p>
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
        { isTextOrNumber && (
          languages.map(language => (
            <FormField
              control={propertyForm.control}
              key={language.code}
              name={`symbols.${language.code}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <p>
                      {t('page.product-properties.form.symbols', {
                        language: t(`language.${language.code}`),
                      })}
                    </p>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('page.product-properties.form.symbols', {
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
          ))
        ) }
        <FormField
          control={propertyForm.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <p>
                  {t('page.product-properties.form.type')}
                  <span className="text-destructive ml-1">*</span>
                </p>
              </FormLabel>
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
          control={propertyForm.control}
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

        <div className="flex gap-2 flex-wrap pb-2">
          <FormField
            control={propertyForm.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-md border p-4 grow">
                <div className="space-y-1">
                  <FormLabel className="text-sm">{t('page.product-properties.form.active')}</FormLabel>
                  <FormDescription className="text-xs text-muted-foreground">
                    {t('page.product-properties.form.active.description')}
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
          <FormField
            control={propertyForm.control}
            name="showInTable"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-md border p-4 grow">
                <div className="space-y-1">
                  <FormLabel className="text-sm">{t('page.product-properties.form.showInTable')}</FormLabel>
                  <FormDescription className="text-xs text-muted-foreground">
                    {t('page.product-properties.form.showInTable.description')}
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
          <FormField
            control={propertyForm.control}
            name="showInStatistics"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-md border p-4 grow">
                <div className="space-y-1">
                  <FormLabel className="text-sm">{t('page.product-properties.form.showInStatistics')}</FormLabel>
                  <FormDescription className="text-xs text-muted-foreground">
                    {t('page.product-properties.form.showInStatistics.description')}
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
          <FormField
            control={propertyForm.control}
            name="isRequired"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-md border p-4 grow">
                <div className="space-y-1">
                  <FormLabel className="text-sm">{t('page.product-properties.form.isRequired')}</FormLabel>
                  <FormDescription className="text-xs text-muted-foreground">
                    {t('page.product-properties.form.isRequired.description')}
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
            onClick={closePropertyModal}
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
