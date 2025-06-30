import { useTranslation } from 'react-i18next'
import { useCurrencyOptions, useLanguageQuery } from '@/api/hooks'
import { AsyncSelect } from '@/components/AsyncSelect'
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
import { useCashregisterAccountContext } from '@/contexts'

export function CashregisterAccountForm() {
  const { t, i18n } = useTranslation()
  const { isLoading, form, closeModal, submitCashregisterAccountForm } = useCashregisterAccountContext()

  const { data: { languages = [] } = {} } = useLanguageQuery(
    { pagination: { full: true } },
    { options: {
      select: response => ({
        languages: response.data.languages,
      }),
    } },
  )

  const loadCurrenciesOptions = useCurrencyOptions()

  const onSubmit = (values) => {
    submitCashregisterAccountForm(values)
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
                    {t('page.cashregister-accounts.form.names', {
                      language: t(`language.${language.code}`),
                    })}
                    <span className="text-destructive ml-1">*</span>
                  </p>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('page.cashregister-accounts.form.names', {
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
          name="currencies"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.cashregister-accounts.form.currencies')}</FormLabel>
              <FormControl>
                <AsyncSelect
                  fetcher={loadCurrenciesOptions}
                  renderOption={e => e.names[i18n.language]}
                  getDisplayValue={e => e.names[i18n.language]}
                  getOptionValue={e => e.id}
                  width="100%"
                  className="w-full"
                  name="currencies"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isLoading}
                  multi
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
              <FormLabel>{t('page.cashregister-accounts.form.priority')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={t('page.cashregister-accounts.form.priority')}
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
                  <FormLabel className="text-sm">{t('page.cashregister-accounts.form.active')}</FormLabel>
                  <FormDescription className="text-xs text-muted-foreground">
                    {t('page.cashregister-accounts.form.active.description')}
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
