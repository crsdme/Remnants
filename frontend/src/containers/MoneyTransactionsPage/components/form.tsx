import { useEffect, useState } from 'react'
import { useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useCashregisterAccountOptions, useCashregisterAccountQuery, useCashregisterOptions, useCashregisterQuery, useCurrencyOptions, useCurrencyQuery } from '@/api/hooks'
import { AsyncSelect } from '@/components/AsyncSelect'
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@/components/ui'
import { useMoneyTransactionContext } from '@/contexts'

export function MoneyTransactionForm() {
  const { t } = useTranslation()
  const { selectedTab, setSelectedTab, addForm, accountForm } = useMoneyTransactionContext()

  const onTabChange = (value) => {
    setSelectedTab(value)
    addForm.reset()
    accountForm.reset()
  }

  return (
    <Tabs value={selectedTab} onValueChange={onTabChange}>
      <TabsList className="w-full mb-4">
        <TabsTrigger value="add">{t('page.money-transactions.form.tabs.add')}</TabsTrigger>
        <TabsTrigger value="account">{t('page.money-transactions.form.tabs.account')}</TabsTrigger>
        <TabsTrigger value="cashregister">{t('page.money-transactions.form.tabs.cashregister')}</TabsTrigger>
      </TabsList>
      <TabsContent value="add">
        <AddForm />
      </TabsContent>
      <TabsContent value="account">
        <AccountForm />
      </TabsContent>
      <TabsContent value="cashregister">
        <CashregisterForm />
      </TabsContent>
    </Tabs>
  )
}

function AddForm() {
  const { t, i18n } = useTranslation()
  const { isLoading, addForm, closeModal, submitMoneyTransactionForm } = useMoneyTransactionContext()
  const selectedCashregister = useWatch({
    control: addForm.control,
    name: 'cashregister',
  })
  const selectedCashregisterAccount = useWatch({
    control: addForm.control,
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

  const onSubmit = (values) => {
    submitMoneyTransactionForm(values)
  }

  return (
    <Form {...addForm}>
      <form className="w-full space-y-1" onSubmit={addForm.handleSubmit(onSubmit)}>

        <FormField
          control={addForm.control}
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
                    addForm.setValue('account', '')
                    addForm.setValue('currency', '')
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
          control={addForm.control}
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
                    addForm.setValue('currency', '')
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
          control={addForm.control}
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
                  control={addForm.control}
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
          control={addForm.control}
          name="direction"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <p>
                  {t('page.money-transactions.form.direction')}
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
                    <SelectValue placeholder="..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="in">{t('page.money-transactions.form.direction.in')}</SelectItem>
                  <SelectItem value="out">{t('page.money-transactions.form.direction.out')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={addForm.control}
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

        {/* <div className="flex gap-2 flex-wrap pb-2">
          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-md border p-4 grow">
                <div className="space-y-1">
                  <FormLabel className="text-sm">{t('page.cashregisters.form.active')}</FormLabel>
                  <FormDescription className="text-xs text-muted-foreground">
                    {t('page.cashregisters.form.active.description')}
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
        </div> */}
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

function AccountForm() {
  const { t, i18n } = useTranslation()
  const { isLoading, accountForm, closeModal, submitMoneyTransactionForm } = useMoneyTransactionContext()
  const selectedCashregister = useWatch({
    control: accountForm.control,
    name: 'cashregister',
  })
  const selectedAccountFrom = useWatch({
    control: accountForm.control,
    name: 'accountFrom',
  })
  const selectedAccountTo = useWatch({
    control: accountForm.control,
    name: 'accountTo',
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
    { pagination: { full: true }, filters: { ids: cashregisters.find(cashregister => cashregister.id === cashregister)?.accounts.map(account => account.id) } },
    { options: {
      select: response => ({
        cashregisterAccounts: response.data.cashregisterAccounts,
      }),
    } },
  )

  const loadCashregisterAccountOptions = useCashregisterAccountOptions(
    { defaultFilters: {
      ids: cashregisters
        .find(cashregister => cashregister.id === selectedCashregister)
        ?.accounts
        .map(account => account.id),
    } },
  )

  const loadCurrencyOptions = useCurrencyOptions()

  const onSubmit = (values) => {
    submitMoneyTransactionForm(values)
  }

  return (
    <Form {...accountForm}>
      <form className="w-full space-y-1" onSubmit={accountForm.handleSubmit(onSubmit)}>

        <FormField
          control={accountForm.control}
          name="cashregister"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <p>
                  {t('page.money-transactions.form.cashregister')}
                  <span className="text-destructive ml-1">*</span>
                </p>
              </FormLabel>

              <Select
                value={field.value}
                onValueChange={(e) => {
                  field.onChange(e)
                  accountForm.setValue('accountFrom', '')
                  accountForm.setValue('accountTo', '')
                  accountForm.setValue('currency', '')
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
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 w-full">
          <FormField
            control={accountForm.control}
            name="accountFrom"
            render={({ field }) => (
              <FormItem className="grow">
                <FormLabel>
                  <p>
                    {t('page.money-transactions.form.cashregister-account-from')}
                    <span className="text-destructive ml-1">*</span>
                  </p>
                </FormLabel>
                <FormControl>
                  <AsyncSelect
                    fetcher={loadCashregisterAccountOptions}
                    renderOption={e => `${e.seq} ${e.names[i18n.language]}`}
                    getDisplayValue={e => e.names[i18n.language]}
                    getOptionValue={e => e.id}
                    width="100%"
                    className="w-full"
                    name="accountFrom"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isLoading || !selectedCashregister[0]}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={accountForm.control}
            name="accountTo"
            render={({ field }) => (
              <FormItem className="grow">
                <FormLabel>
                  <p>
                    {t('page.money-transactions.form.cashregister-account-to')}
                    <span className="text-destructive ml-1">*</span>
                  </p>
                </FormLabel>
                <FormControl>
                  <AsyncSelect
                    fetcher={async (params) => {
                      const data = await loadCashregisterAccountOptions({ query: params.query, selectedValue: accountForm.watch('accountFrom') })
                      const excludeIds = accountForm.watch('accountFrom') || []
                      return data.filter(d => !excludeIds.includes(d.id))
                    }}
                    renderOption={e => `${e.seq} ${e.names[i18n.language]}`}
                    getDisplayValue={e => e.names[i18n.language]}
                    getOptionValue={e => e.id}
                    width="100%"
                    className="w-full"
                    name="accountTo"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isLoading || !selectedAccountFrom[0]}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={accountForm.control}
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
                  control={accountForm.control}
                  name="currency"
                  render={({ field }) => (
                    <AsyncSelect
                      fetcher={async (params) => {
                        const accountsFrom = cashregisterAccounts.find(account => account.id === accountForm.watch('accountFrom')?.[0])?.currencies.map(currency => currency.id) || []
                        const accountsTo = cashregisterAccounts.find(account => account.id === accountForm.watch('accountTo')?.[0])?.currencies.map(currency => currency.id) || []

                        const ids = accountsFrom.filter(value => accountsTo.includes(value))

                        const data = await loadCurrencyOptions({ query: params.query })
                        return data.filter(d => ids.includes(d.id))
                      }}
                      renderOption={e => `${e.symbols[i18n.language]}`}
                      getDisplayValue={e => e.symbols[i18n.language]}
                      getOptionValue={e => e.id}
                      name="currency"
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isLoading || !selectedAccountTo[0]}
                    />
                  )}
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={accountForm.control}
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

function CashregisterForm() {
  const { t, i18n } = useTranslation()
  const { isLoading, cashregisterForm, closeModal, submitMoneyTransactionForm } = useMoneyTransactionContext()
  const cashregisterFrom = useWatch({
    control: cashregisterForm.control,
    name: 'cashregisterFrom',
  })
  const cashregisterTo = useWatch({
    control: cashregisterForm.control,
    name: 'cashregisterTo',
  })
  const accountFrom = useWatch({
    control: cashregisterForm.control,
    name: 'accountFrom',
  })
  const accountTo = useWatch({
    control: cashregisterForm.control,
    name: 'accountTo',
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
    { pagination: { full: true }, filters: { ids: cashregisters.find(cashregister => cashregister.id === cashregister)?.accounts.map(account => account.id) } },
    { options: {
      select: response => ({
        cashregisterAccounts: response.data.cashregisterAccounts,
      }),
    } },
  )

  const loadCashregisterAccountOptions = useCashregisterAccountOptions(
    { defaultFilters: {
      ids: cashregisters
        .find(cashregister => cashregister.id === cashregisterFrom)
        ?.accounts
        .map(account => account.id),
    } },
  )

  const loadCurrencyOptions = useCurrencyOptions()

  const loadCashregisterOptions = useCashregisterOptions()

  const onSubmit = (values) => {
    submitMoneyTransactionForm(values)
  }

  return (
    <Form {...cashregisterForm}>
      <form className="w-full space-y-1" onSubmit={cashregisterForm.handleSubmit(onSubmit)}>

        <div className="flex gap-2 w-full">
          <FormField
            control={cashregisterForm.control}
            name="cashregisterFrom"
            render={({ field }) => (
              <FormItem className="grow">
                <FormLabel>
                  <p>
                    {t('page.money-transactions.form.cashregister-from')}
                    <span className="text-destructive ml-1">*</span>
                  </p>
                </FormLabel>
                <FormControl>
                  <AsyncSelect
                    fetcher={loadCashregisterOptions}
                    renderOption={e => `${e.names[i18n.language]}`}
                    getDisplayValue={e => e.names[i18n.language]}
                    getOptionValue={e => e.id}
                    width="100%"
                    className="w-full"
                    name="cashregisterFrom"
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e)
                      cashregisterForm.setValue('cashregisterTo', '')
                      cashregisterForm.setValue('accountFrom', '')
                      cashregisterForm.setValue('accountTo', '')
                      cashregisterForm.setValue('currency', '')
                    }}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={cashregisterForm.control}
            name="cashregisterTo"
            render={({ field }) => (
              <FormItem className="grow">
                <FormLabel>
                  <p>
                    {t('page.money-transactions.form.cashregister-to')}
                    <span className="text-destructive ml-1">*</span>
                  </p>
                </FormLabel>
                <FormControl>
                  <AsyncSelect
                    fetcher={async (params) => {
                      const data = await loadCashregisterOptions({ query: params.query, selectedValue: cashregisterForm.watch('cashregisterFrom') })
                      const excludeIds = cashregisterForm.watch('cashregisterFrom') || []
                      return data.filter(d => !excludeIds.includes(d.id))
                    }}
                    renderOption={e => `${e.names[i18n.language]}`}
                    getDisplayValue={e => e.names[i18n.language]}
                    getOptionValue={e => e.id}
                    width="100%"
                    className="w-full"
                    name="cashregisterTo"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isLoading || !cashregisterFrom[0]}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-2 w-full">
          <FormField
            control={cashregisterForm.control}
            name="accountFrom"
            render={({ field }) => (
              <FormItem className="grow">
                <FormLabel>
                  <p>
                    {t('page.money-transactions.form.cashregister-account-from')}
                    <span className="text-destructive ml-1">*</span>
                  </p>
                </FormLabel>
                <FormControl>
                  <AsyncSelect
                    fetcher={async (params) => {
                      const data = await loadCashregisterAccountOptions({ query: params.query })
                      const ids = cashregisters.find(cashregister => cashregister.id === cashregisterFrom[0])?.accounts.map(account => account.id) || []
                      return data.filter(d => ids.includes(d.id))
                    }}
                    renderOption={e => `${e.seq} ${e.names[i18n.language]}`}
                    getDisplayValue={e => e.names[i18n.language]}
                    getOptionValue={e => e.id}
                    width="100%"
                    className="w-full"
                    name="accountFrom"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isLoading || !cashregisterTo[0]}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={cashregisterForm.control}
            name="accountTo"
            render={({ field }) => (
              <FormItem className="grow">
                <FormLabel>
                  <p>
                    {t('page.money-transactions.form.cashregister-account-to')}
                    <span className="text-destructive ml-1">*</span>
                  </p>
                </FormLabel>
                <FormControl>
                  <AsyncSelect
                    fetcher={async (params) => {
                      const data = await loadCashregisterAccountOptions({ query: params.query })
                      const ids = cashregisters.find(cashregister => cashregister.id === cashregisterTo[0])?.accounts.map(account => account.id) || []
                      return data.filter(d => ids.includes(d.id))
                    }}
                    renderOption={e => `${e.seq} ${e.names[i18n.language]}`}
                    getDisplayValue={e => e.names[i18n.language]}
                    getOptionValue={e => e.id}
                    width="100%"
                    className="w-full"
                    name="accountTo"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isLoading || !accountFrom[0]}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={cashregisterForm.control}
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
                  control={cashregisterForm.control}
                  name="currency"
                  render={({ field }) => (
                    <AsyncSelect
                      fetcher={async (params) => {
                        const accountsFrom = cashregisterAccounts.find(account => account.id === accountFrom[0])?.currencies.map(currency => currency.id) || []
                        const accountsTo = cashregisterAccounts.find(account => account.id === accountTo[0])?.currencies.map(currency => currency.id) || []

                        const ids = accountsFrom.filter(value => accountsTo.includes(value))

                        const data = await loadCurrencyOptions({ query: params.query })
                        return data.filter(d => ids.includes(d.id))
                      }}
                      renderOption={e => `${e.symbols[i18n.language]}`}
                      getDisplayValue={e => e.symbols[i18n.language]}
                      getOptionValue={e => e.id}
                      name="currency"
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isLoading || !accountTo[0]}
                    />
                  )}
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={cashregisterForm.control}
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
