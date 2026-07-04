import { useLanguageQuery } from '@/api/hooks'
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
  Textarea,
} from '@/components/ui'
import { useLocale } from '@/utils/hooks'
import { useCurrencyContext } from '../context'

export function CurrencyForm() {
  const { t } = useLocale()
  const { isLoading, form, closeModal, submitCurrencyForm } = useCurrencyContext()

  const { languages = [] } = useLanguageQuery(
    { pagination: { full: true } },
    { options: { placeholderData: prevData => prevData } },
  )

  return (
    <Form {...form}>
      <form
        className="w-full space-y-1"
        onSubmit={e => void form.handleSubmit(submitCurrencyForm)(e)}
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
                    {t('page.currencies.form.names', {
                      language: t(`language.${language.code}`),
                    })}
                    <span className="text-destructive ml-1">*</span>
                  </p>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('page.currencies.form.names', {
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
        {languages.map(language => (
          <FormField
            control={form.control}
            key={language.code}
            name={`symbols.${language.code}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <p>
                    {t('page.currencies.form.symbols', {
                      language: t(`language.${language.code}`),
                    })}
                    <span className="text-destructive ml-1">*</span>
                  </p>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('page.currencies.form.symbols', {
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
          name="scale"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.currencies.form.scale')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={t('page.currencies.form.scale')}
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
          name="paymentEpsilon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.currencies.form.paymentEpsilon')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={t('page.currencies.form.paymentEpsilon')}
                  className="w-full"
                  {...field}
                  disabled={isLoading}
                  onChange={e => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription className="text-xs text-muted-foreground">
                {t('page.currencies.form.paymentEpsilon.description')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.currencies.form.priority')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={t('page.currencies.form.priority')}
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
                  <FormLabel className="text-sm">{t('page.currencies.form.active')}</FormLabel>
                  <FormDescription className="text-xs text-muted-foreground">
                    {t('page.currencies.form.active.description')}
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

export function ExchangeRateForm() {
  const { t } = useLocale()
  const { isLoading, exchangeRateForm, closeExchangeRateModal, submitExchangeRateForm } = useCurrencyContext()

  return (
    <Form {...exchangeRateForm}>
      <form className="w-full space-y-1" onSubmit={e => void exchangeRateForm.handleSubmit(submitExchangeRateForm)(e)}>
        <FormField
          control={exchangeRateForm.control}
          name="rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <p>
                  {t('page.currencies.form.rate')}
                  <span className="text-destructive ml-1">*</span>
                </p>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={t('page.currencies.form.rate')}
                  className="w-full"
                  disabled={isLoading}
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={exchangeRateForm.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <p>
                  {t('page.currencies.form.comment')}
                </p>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('page.currencies.form.comment')}
                  className="w-full"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => closeExchangeRateModal()}
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
