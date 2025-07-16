import { useTranslation } from 'react-i18next'

import { useLanguageQuery } from '@/api/hooks'
import { ColorPicker } from '@/components'
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
} from '@/components/ui'
import { useDeliveryServiceContext } from '@/contexts'

export function DeliveryServiceForm() {
  const { t } = useTranslation()
  const { isLoading, form, closeModal, submitDeliveryServiceForm } = useDeliveryServiceContext()

  const { data: { languages = [] } = {} } = useLanguageQuery(
    { pagination: { full: true } },
    { options: {
      select: response => ({
        languages: response.data.languages,
      }),
    } },
  )

  const onSubmit = (values) => {
    submitDeliveryServiceForm(values)
  }

  return (
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
                    {t('page.delivery-services.form.names', {
                      language: t(`language.${language.code}`),
                    })}
                    <span className="text-destructive ml-1">*</span>
                  </p>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('page.delivery-services.form.names', {
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
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.delivery-services.form.priority')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={t('page.delivery-services.form.priority')}
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
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <p>
                  {t('page.delivery-services.form.type')}
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
                    <SelectValue placeholder={t('page.delivery-services.form.type')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="novaposhta">
                    {t('delivery-services.novaposhta')}
                  </SelectItem>
                  <SelectItem value="selfpickup">
                    {t('delivery-services.selfpickup')}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
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
              <FormLabel>{t('page.delivery-services.form.color')}</FormLabel>
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
