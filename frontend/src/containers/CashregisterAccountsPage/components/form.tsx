import { useCurrencyOptions, useLanguageQuery } from '@/api/hooks'
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
} from '@/components/ui'
import { useLocale } from '@/utils/hooks'
import { useCashregisterAccountContext } from '../context'

export function CashregisterAccountForm() {
  const { t, language } = useLocale()
  const { isLoading, form, closeModal, submitCashregisterAccountForm } = useCashregisterAccountContext()

  const { languages } = useLanguageQuery({ pagination: { full: true } })

  const loadCurrenciesOptions = useCurrencyOptions()

  return (
    <Form {...form}>
      <form
        className="w-full space-y-1"
        onSubmit={(e) => { void form.handleSubmit(v => submitCashregisterAccountForm(v))(e) }}
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
                <AsyncSelectNew
                  loadOptions={loadCurrenciesOptions}
                  renderOption={e => e.names[language]}
                  getDisplayValue={e => e.names[language]}
                  getOptionValue={e => e.id}
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
