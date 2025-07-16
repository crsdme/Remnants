import { useTranslation } from 'react-i18next'

import { useLanguageQuery } from '@/api/hooks'
import { AsyncSelect, ColorPicker } from '@/components'
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
} from '@/components/ui'
import { useDeliveryStatusContext } from '@/contexts'
import i18n from '@/locales/i18n'

export function DeliveryStatusForm() {
  const { t } = useTranslation()
  const { isLoading, form, closeModal, submitDeliveryStatusForm } = useDeliveryStatusContext()

  const { data: { languages = [] } = {} } = useLanguageQuery(
    { pagination: { full: true } },
    { options: {
      select: response => ({
        languages: response.data.languages,
      }),
    } },
  )

  const onSubmit = (values) => {
    submitDeliveryStatusForm(values)
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
                    {t('page.delivery-statuses.form.names', {
                      language: t(`language.${language.code}`),
                    })}
                    <span className="text-destructive ml-1">*</span>
                  </p>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('page.delivery-statuses.form.names', {
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
              <FormLabel>{t('page.delivery-statuses.form.priority')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={t('page.delivery-statuses.form.priority')}
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
              <FormLabel>{t('page.delivery-statuses.form.color')}</FormLabel>
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
