import { useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useCashregisterAccountQuery, useCashregisterQuery, useCurrencyQuery } from '@/api/hooks'

import { Button, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from '@/components/ui'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { usePayProcurementContext } from '../context'

export function PayProcurementForm() {
  const { t, i18n } = useTranslation()
  const { isLoading, form, submitPayProcurementForm } = usePayProcurementContext()

  const selectedCashregister = useWatch({
    control: form.control,
    name: 'cashregister',
  })
  const selectedCashregisterAccount = useWatch({
    control: form.control,
    name: 'account',
  })

  const { data: { cashregisters = [] } = {} } = useCashregisterQuery(
    { pagination: { full: true }, filters: { active: [true] } },
    { options: {
      select: response => ({
        cashregisters: response.data.cashregisters,
      }),
    } },
  )

  const { data: { cashregisterAccounts = [] } = {} } = useCashregisterAccountQuery(
    { pagination: { full: true }, filters: { ids: cashregisters.find(cashregister => cashregister.id === selectedCashregister)?.accounts.map(account => account.id) } },
    { options: {
      select: response => ({
        cashregisterAccounts: response.data.cashregisterAccounts,
      }),
    } },
  )

  const { data: { currencies = [] } = {} } = useCurrencyQuery(
    { pagination: { full: true }, filters: { ids: cashregisterAccounts.find(account => account.id === selectedCashregisterAccount)?.currencies.map(currency => currency.id) } },
    { options: {
      select: response => ({
        currencies: response.data.currencies,
      }),
    } },
  )

  const onSubmit = (value) => {
    submitPayProcurementForm(value)
  }

  return (
    <>
      <Card className="flex-1">
        <CardHeader>{t('page.procurements.pay.title')}</CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="w-full space-y-1" onSubmit={form.handleSubmit(onSubmit)}>

              <FormField
                control={form.control}
                name="cashregister"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <p>
                        {t('page.money-transactions.form.cashregister')}
                        <span className="text-destructive ml-1">*</span>
                      </p>
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(e) => {
                          field.onChange(e)
                          form.setValue('account', '')
                          form.setValue('currency', '')
                        }}
                        disabled={isLoading}
                        {...field}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t('page.money-transactions.form.cashregister')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cashregisters.map(cashregister => (
                            <SelectItem key={cashregister.id} value={cashregister.id}>
                              {cashregister.names[i18n.language]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="account"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <p>
                        {t('page.money-transactions.form.cashregister-account')}
                        <span className="text-destructive ml-1">*</span>
                      </p>
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(e) => {
                          field.onChange(e)
                          form.setValue('currency', '')
                        }}
                        disabled={isLoading || !selectedCashregister}
                        {...field}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t('page.money-transactions.form.cashregister-account')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cashregisterAccounts.map(account => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.names[i18n.language]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <p>
                        {t('page.money-transactions.form.amount')}
                        <span className="text-destructive ml-1">*</span>
                      </p>
                    </FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={t('page.money-transactions.form.amount')}
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
                            disabled={isLoading || !selectedCashregisterAccount}
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <p>
                        {t('page.money-transactions.form.description')}
                      </p>
                    </FormLabel>
                    <Textarea {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} loading={isLoading}>
                  {t('button.submit')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  )
}
