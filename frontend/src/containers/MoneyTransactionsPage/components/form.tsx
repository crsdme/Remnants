import type { MoneyTransactionTab } from '../context'
import { useCallback, useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import {
  useCashregisterAccountSelectOptions,
  useCashregisterQuery,
  useCashregisterSelectOptions,
  useCurrencySelectOptions,
} from '@/api/hooks'
import { AsyncSelectMenu } from '@/components/AsyncSelectMenu'
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
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@/components/ui'
import { useAccountIdsWithCapability, useEntityAccessIds, useEntityIdsWithCapability, useLocale } from '@/utils/hooks'
import { useMoneyTransactionContext } from '../context'

export function MoneyTransactionForm() {
  const { t } = useLocale()
  const { selectedTab, setSelectedTab, addForm, accountForm, cashregisterForm, availableTabs } = useMoneyTransactionContext()

  const onTabChange = (value: string) => {
    setSelectedTab(value as MoneyTransactionTab)
    addForm.reset()
    accountForm.reset()
    cashregisterForm.reset()
  }

  if (availableTabs.length === 0)
    return null

  return (
    <Tabs value={selectedTab} onValueChange={onTabChange}>
      {availableTabs.length > 1 && (
        <TabsList className="mb-4 grid w-full" style={{ gridTemplateColumns: `repeat(${availableTabs.length}, minmax(0, 1fr))` }}>
          {availableTabs.map(tab => (
            <TabsTrigger key={tab} value={tab}>{t(`page.money-transactions.form.tabs.${tab}`)}</TabsTrigger>
          ))}
        </TabsList>
      )}
      {availableTabs.includes('add') && (
        <TabsContent value="add">
          <AddForm />
        </TabsContent>
      )}
      {availableTabs.includes('account') && (
        <TabsContent value="account">
          <AccountForm />
        </TabsContent>
      )}
      {availableTabs.includes('cashregister') && (
        <TabsContent value="cashregister">
          <CashregisterForm />
        </TabsContent>
      )}
    </Tabs>
  )
}

function AddForm() {
  const { t, language } = useLocale()
  const { isLoading, addForm, closeModal, submitMoneyTransactionForm } = useMoneyTransactionContext()
  const selectedDirection = useWatch({
    control: addForm.control,
    name: 'direction',
  })
  const neededCapability = selectedDirection === 'out' ? 'transfer' : 'receive'
  const cashregisterIds = useEntityIdsWithCapability('cashregisters', neededCapability)
  const allowedAccountIds = useAccountIdsWithCapability(neededCapability)

  const selectedCashregister = useWatch({
    control: addForm.control,
    name: 'cashregister',
  })
  const selectedCashregisterAccount = useWatch({
    control: addForm.control,
    name: 'account',
  })

  const { cashregisters } = useCashregisterQuery(
    { pagination: { full: true }, filters: { active: [true] } },
  )

  const { loadSearchOptions: loadCashregisterSearch, loadSelectedOptions: loadCashregisterSelected } = useCashregisterSelectOptions({
    defaultFilters: { active: [true], language },
  })

  const accountIds = useMemo(() => {
    const ids = cashregisters.find(cashregister => cashregister.id === selectedCashregister)?.accounts.map(account => account.id) ?? []
    if (allowedAccountIds == null)
      return ids
    const allowed = new Set(allowedAccountIds)
    return ids.filter(id => allowed.has(id))
  }, [cashregisters, allowedAccountIds, selectedCashregister])

  const { loadSearchOptions: loadAccountSearch, loadSelectedOptions: loadAccountSelected } = useCashregisterAccountSelectOptions({
    defaultFilters: { ids: accountIds },
  })

  const { loadSearchOptions: loadCurrencySearch, loadSelectedOptions: loadCurrencySelected } = useCurrencySelectOptions({
    defaultFilters: { language },
  })

  const loadCashregisterOptions = useCallback(
    async (query: string) => {
      const cashregisterList = await loadCashregisterSearch(query)
      if (cashregisterIds == null)
        return cashregisterList
      const allowed = new Set(cashregisterIds)
      return cashregisterList.filter(cashregister => allowed.has(cashregister.id))
    },
    [loadCashregisterSearch, cashregisterIds],
  )

  const loadAccountOptions = useCallback(
    async (query: string) => {
      if (!selectedCashregister || !accountIds?.length)
        return []

      return loadAccountSearch(query)
    },
    [accountIds, loadAccountSearch, selectedCashregister],
  )

  const loadCurrencyOptions = useCallback(
    async (query: string) => {
      if (!selectedCashregisterAccount)
        return []

      const [account] = await loadAccountSelected([selectedCashregisterAccount])
      const currencyIds = account?.currencies.map(currency => currency.id) ?? []
      const currencies = await loadCurrencySearch(query)

      return currencies.filter(currency => currencyIds.includes(currency.id))
    },
    [loadAccountSelected, loadCurrencySearch, selectedCashregisterAccount],
  )

  return (
    <Form {...addForm}>
      <form
        className="w-full space-y-3"
        onSubmit={(e) => { void addForm.handleSubmit(v => submitMoneyTransactionForm(v))(e) }}
      >

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
                onValueChange={(value) => {
                  field.onChange(value)
                  addForm.setValue('cashregister', '')
                  addForm.setValue('account', '')
                  addForm.setValue('currency', '')
                }}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('page.money-transactions.form.direction')} />
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
          name="cashregister"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <p>
                  {t('page.money-transactions.form.cashregister')}
                  <span className="text-destructive ml-1">*</span>
                </p>
              </FormLabel>
              <AsyncSelectMenu
                loadSearchOptions={loadCashregisterOptions}
                loadSelectedOptions={loadCashregisterSelected}
                field={field}
                value={field.value}
                onChange={(value) => {
                  const id = typeof value === 'string' ? value : value[0] ?? ''
                  field.onChange(id)
                  addForm.setValue('account', '')
                  addForm.setValue('currency', '')
                }}
                renderOption={cashregister => cashregister.names[language]}
                getDisplayValue={cashregister => cashregister.names[language]}
                getOptionValue={cashregister => cashregister.id}
                triggerClassName="w-full"
                disabled={isLoading}
                searchable
                clearable
              />
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
              <AsyncSelectMenu
                loadSearchOptions={loadAccountOptions}
                loadSelectedOptions={loadAccountSelected}
                field={field}
                value={field.value}
                onChange={(value) => {
                  const id = typeof value === 'string' ? value : value[0] ?? ''
                  field.onChange(id)
                  addForm.setValue('currency', '')
                }}
                renderOption={account => `${account.seq} ${account.names[language]}`}
                getDisplayValue={account => account.names[language]}
                getOptionValue={account => account.id}
                triggerClassName="w-full"
                disabled={isLoading || !selectedCashregister}
                searchable
                clearable
              />
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
              <div className="flex min-w-0 items-center gap-2">
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t('page.money-transactions.form.amount')}
                    className="min-w-0 flex-1"
                    {...field}
                    disabled={isLoading}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormField
                  control={addForm.control}
                  name="currency"
                  render={({ field: currencyField }) => (
                    <AsyncSelectMenu
                      loadSearchOptions={loadCurrencyOptions}
                      loadSelectedOptions={loadCurrencySelected}
                      field={currencyField}
                      value={currencyField.value}
                      onChange={currencyField.onChange}
                      renderOption={currency => currency.symbols[language]}
                      getDisplayValue={currency => currency.symbols[language]}
                      getOptionValue={currency => currency.id}
                      triggerClassName="w-[80px]"
                      placeholder="..."
                      disabled={isLoading || !selectedCashregisterAccount}
                      clearable
                    />
                  )}
                />
              </div>
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
  const { t, language } = useLocale()
  const { isLoading, accountForm, closeModal, submitMoneyTransactionForm } = useMoneyTransactionContext()
  const transferFromIds = useEntityIdsWithCapability('cashregisters', 'transfer')
  const transferAccountIds = useAccountIdsWithCapability('transfer')
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

  const { cashregisters } = useCashregisterQuery(
    { pagination: { full: true }, filters: { active: [true] } },
  )

  const { loadSearchOptions: loadCashregisterSearch, loadSelectedOptions: loadCashregisterSelected } = useCashregisterSelectOptions({
    defaultFilters: { active: [true], language },
  })

  const registerAccounts = useMemo(
    () => cashregisters.find(cashregister => cashregister.id === selectedCashregister)?.accounts.map(account => account.id) ?? [],
    [cashregisters, selectedCashregister],
  )

  const accountIdsFrom = useMemo(() => {
    if (transferAccountIds == null)
      return registerAccounts
    const allowed = new Set(transferAccountIds)
    return registerAccounts.filter(id => allowed.has(id))
  }, [registerAccounts, transferAccountIds])

  const accountIdsTo = useMemo(() => {
    return registerAccounts.filter(id => id !== selectedAccountFrom)
  }, [registerAccounts, selectedAccountFrom])

  const { loadSearchOptions: loadAccountFromSearch, loadSelectedOptions: loadAccountSelected } = useCashregisterAccountSelectOptions({
    defaultFilters: { ids: accountIdsFrom },
  })

  const { loadSearchOptions: loadAccountToSearch } = useCashregisterAccountSelectOptions({
    defaultFilters: { ids: accountIdsTo },
  })

  const { loadSearchOptions: loadCurrencySearch, loadSelectedOptions: loadCurrencySelected } = useCurrencySelectOptions({
    defaultFilters: { language },
  })

  const loadCashregisterOptions = useCallback(
    async (query: string) => {
      const cashregisterList = await loadCashregisterSearch(query)
      if (transferFromIds == null)
        return cashregisterList
      const allowed = new Set(transferFromIds)
      return cashregisterList.filter(cashregister => allowed.has(cashregister.id))
    },
    [loadCashregisterSearch, transferFromIds],
  )

  const loadAccountOptions = useCallback(
    async (query: string) => {
      if (!selectedCashregister || !accountIdsFrom.length)
        return []

      return loadAccountFromSearch(query)
    },
    [accountIdsFrom, loadAccountFromSearch, selectedCashregister],
  )

  const loadAccountToOptions = useCallback(
    async (query: string) => {
      if (!selectedCashregister || !accountIdsTo.length)
        return []

      const accounts = await loadAccountToSearch(query)
      const excludeId = selectedAccountFrom
      return excludeId
        ? accounts.filter(account => account.id !== excludeId)
        : accounts
    },
    [accountIdsTo, loadAccountToSearch, selectedAccountFrom, selectedCashregister],
  )

  const loadCurrencyOptions = useCallback(
    async (query: string) => {
      const fromId = selectedAccountFrom
      const toId = selectedAccountTo

      if (!fromId || !toId)
        return []

      const [fromAccount, toAccount] = await loadAccountSelected([fromId, toId])
      const fromCurrencyIds = fromAccount?.currencies.map(currency => currency.id) ?? []
      const toCurrencyIds = toAccount?.currencies.map(currency => currency.id) ?? []
      const currencyIds = fromCurrencyIds.filter(id => toCurrencyIds.includes(id))
      const currencies = await loadCurrencySearch(query)

      return currencies.filter(currency => currencyIds.includes(currency.id))
    },
    [loadAccountSelected, loadCurrencySearch, selectedAccountFrom, selectedAccountTo],
  )

  return (
    <Form {...accountForm}>
      <form
        className="w-full space-y-3"
        onSubmit={(e) => { void accountForm.handleSubmit(v => submitMoneyTransactionForm(v))(e) }}
      >

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
              <AsyncSelectMenu
                loadSearchOptions={loadCashregisterOptions}
                loadSelectedOptions={loadCashregisterSelected}
                field={field}
                value={field.value}
                onChange={(value) => {
                  const id = typeof value === 'string' ? value : value[0] ?? ''
                  field.onChange(id)
                  accountForm.setValue('accountFrom', '')
                  accountForm.setValue('accountTo', '')
                  accountForm.setValue('currency', '')
                }}
                renderOption={cashregister => cashregister.names[language]}
                getDisplayValue={cashregister => cashregister.names[language]}
                getOptionValue={cashregister => cashregister.id}
                triggerClassName="w-full"
                disabled={isLoading}
                searchable
                clearable
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-2 w-full">
          <FormField
            control={accountForm.control}
            name="accountFrom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <p>
                    {t('page.money-transactions.form.cashregister-account-from')}
                    <span className="text-destructive ml-1">*</span>
                  </p>
                </FormLabel>
                <AsyncSelectMenu
                  loadSearchOptions={loadAccountOptions}
                  loadSelectedOptions={loadAccountSelected}
                  field={field}
                  value={field.value}
                  onChange={field.onChange}
                  renderOption={account => `${account.seq} ${account.names[language]}`}
                  getDisplayValue={account => account.names[language]}
                  getOptionValue={account => account.id}
                  triggerClassName="w-full"
                  disabled={isLoading || !selectedCashregister}
                  searchable
                  clearable
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={accountForm.control}
            name="accountTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <p>
                    {t('page.money-transactions.form.cashregister-account-to')}
                    <span className="text-destructive ml-1">*</span>
                  </p>
                </FormLabel>
                <AsyncSelectMenu
                  loadSearchOptions={loadAccountToOptions}
                  loadSelectedOptions={loadAccountSelected}
                  field={field}
                  value={field.value}
                  onChange={field.onChange}
                  renderOption={account => `${account.seq} ${account.names[language]}`}
                  getDisplayValue={account => account.names[language]}
                  getOptionValue={account => account.id}
                  triggerClassName="w-full"
                  disabled={isLoading || !selectedAccountFrom}
                  searchable
                  clearable
                />
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
              <div className="flex min-w-0 items-center gap-2">
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t('page.money-transactions.form.amount')}
                    className="min-w-0 flex-1"
                    {...field}
                    disabled={isLoading}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormField
                  control={accountForm.control}
                  name="currency"
                  render={({ field: currencyField }) => (
                    <AsyncSelectMenu
                      loadSearchOptions={loadCurrencyOptions}
                      loadSelectedOptions={loadCurrencySelected}
                      field={currencyField}
                      value={currencyField.value}
                      onChange={currencyField.onChange}
                      renderOption={currency => currency.symbols[language]}
                      getDisplayValue={currency => currency.symbols[language]}
                      getOptionValue={currency => currency.id}
                      triggerClassName="w-20 min-w-20 max-w-20 shrink-0 overflow-hidden px-2"
                      placeholder="..."
                      disabled={isLoading || !selectedAccountTo}
                      clearable
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
  const { t, language } = useLocale()
  const { isLoading, cashregisterForm, closeModal, submitMoneyTransactionForm } = useMoneyTransactionContext()
  const transferFromIds = useEntityIdsWithCapability('cashregisters', 'transfer')
  const destCashregisterIds = useEntityAccessIds('cashregisters')
  const transferAccountIds = useAccountIdsWithCapability('transfer')
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

  const { cashregisters } = useCashregisterQuery(
    { pagination: { full: true }, filters: { active: [true] } },
  )

  const { loadSearchOptions: loadCashregisterSearch, loadSelectedOptions: loadCashregisterSelected } = useCashregisterSelectOptions({
    defaultFilters: { active: [true], language },
  })

  const accountIdsFrom = useMemo(() => {
    const ids = cashregisters.find(cashregister => cashregister.id === cashregisterFrom)?.accounts.map(account => account.id) ?? []
    if (transferAccountIds == null)
      return ids
    const allowed = new Set(transferAccountIds)
    return ids.filter(id => allowed.has(id))
  }, [cashregisters, cashregisterFrom, transferAccountIds])

  const accountIdsTo = useMemo(() => {
    return cashregisters.find(cashregister => cashregister.id === cashregisterTo)?.accounts.map(account => account.id) ?? []
  }, [cashregisters, cashregisterTo])

  const { loadSearchOptions: loadAccountFromSearch, loadSelectedOptions: loadAccountFromSelected } = useCashregisterAccountSelectOptions({
    defaultFilters: { ids: accountIdsFrom },
  })

  const { loadSearchOptions: loadAccountToSearch, loadSelectedOptions: loadAccountToSelected } = useCashregisterAccountSelectOptions({
    defaultFilters: { ids: accountIdsTo },
  })

  const { loadSearchOptions: loadCurrencySearch, loadSelectedOptions: loadCurrencySelected } = useCurrencySelectOptions({
    defaultFilters: { language },
  })

  const loadCashregisterFromOptions = useCallback(
    async (query: string) => {
      const cashregisterList = await loadCashregisterSearch(query)
      if (transferFromIds == null)
        return cashregisterList
      const allowed = new Set(transferFromIds)
      return cashregisterList.filter(cashregister => allowed.has(cashregister.id))
    },
    [loadCashregisterSearch, transferFromIds],
  )

  const loadCashregisterToOptions = useCallback(
    async (query: string) => {
      const excludeId = cashregisterFrom
      const cashregisterList = await loadCashregisterSearch(query)
      const filtered = destCashregisterIds == null
        ? cashregisterList
        : cashregisterList.filter(cashregister => destCashregisterIds.includes(cashregister.id))

      return excludeId
        ? filtered.filter(cashregister => cashregister.id !== excludeId)
        : filtered
    },
    [cashregisterFrom, destCashregisterIds, loadCashregisterSearch],
  )

  const loadAccountFromOptions = useCallback(
    async (query: string) => {
      if (!cashregisterFrom || !accountIdsFrom?.length)
        return []

      return loadAccountFromSearch(query)
    },
    [accountIdsFrom, cashregisterFrom, loadAccountFromSearch],
  )

  const loadAccountToOptions = useCallback(
    async (query: string) => {
      if (!cashregisterTo || !accountIdsTo?.length)
        return []

      return loadAccountToSearch(query)
    },
    [accountIdsTo, cashregisterTo, loadAccountToSearch],
  )

  const loadCurrencyOptions = useCallback(
    async (query: string) => {
      const fromId = accountFrom
      const toId = accountTo

      if (!fromId || !toId)
        return []

      const [fromAccount, toAccount] = await Promise.all([
        loadAccountFromSelected([fromId]).then(items => items[0]),
        loadAccountToSelected([toId]).then(items => items[0]),
      ])

      const fromCurrencyIds = fromAccount?.currencies.map(currency => currency.id) ?? []
      const toCurrencyIds = toAccount?.currencies.map(currency => currency.id) ?? []
      const currencyIds = fromCurrencyIds.filter(id => toCurrencyIds.includes(id))
      const currencies = await loadCurrencySearch(query)

      return currencies.filter(currency => currencyIds.includes(currency.id))
    },
    [accountFrom, accountTo, loadAccountFromSelected, loadAccountToSelected, loadCurrencySearch],
  )

  return (
    <Form {...cashregisterForm}>
      <form
        className="w-full space-y-3"
        onSubmit={(e) => { void cashregisterForm.handleSubmit(v => submitMoneyTransactionForm(v))(e) }}
      >

        <div className="grid grid-cols-1 gap-2 w-full">
          <FormField
            control={cashregisterForm.control}
            name="cashregisterFrom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <p>
                    {t('page.money-transactions.form.cashregister-from')}
                    <span className="text-destructive ml-1">*</span>
                  </p>
                </FormLabel>
                <AsyncSelectMenu
                  loadSearchOptions={loadCashregisterFromOptions}
                  loadSelectedOptions={loadCashregisterSelected}
                  field={field}
                  value={field.value}
                  onChange={(value) => {
                    const id = typeof value === 'string' ? value : value[0] ?? ''
                    field.onChange(id)
                    cashregisterForm.setValue('cashregisterTo', '')
                    cashregisterForm.setValue('accountFrom', '')
                    cashregisterForm.setValue('accountTo', '')
                    cashregisterForm.setValue('currency', '')
                  }}
                  renderOption={cashregister => cashregister.names[language]}
                  getDisplayValue={cashregister => cashregister.names[language]}
                  getOptionValue={cashregister => cashregister.id}
                  triggerClassName="w-full"
                  disabled={isLoading}
                  searchable
                  clearable
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={cashregisterForm.control}
            name="cashregisterTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <p>
                    {t('page.money-transactions.form.cashregister-to')}
                    <span className="text-destructive ml-1">*</span>
                  </p>
                </FormLabel>
                <AsyncSelectMenu
                  loadSearchOptions={loadCashregisterToOptions}
                  loadSelectedOptions={loadCashregisterSelected}
                  field={field}
                  value={field.value}
                  onChange={field.onChange}
                  renderOption={cashregister => cashregister.names[language]}
                  getDisplayValue={cashregister => cashregister.names[language]}
                  getOptionValue={cashregister => cashregister.id}
                  triggerClassName="w-full"
                  disabled={isLoading || !cashregisterFrom}
                  searchable
                  clearable
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-2 w-full">
          <FormField
            control={cashregisterForm.control}
            name="accountFrom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <p>
                    {t('page.money-transactions.form.cashregister-account-from')}
                    <span className="text-destructive ml-1">*</span>
                  </p>
                </FormLabel>
                <AsyncSelectMenu
                  loadSearchOptions={loadAccountFromOptions}
                  loadSelectedOptions={loadAccountFromSelected}
                  field={field}
                  value={field.value}
                  onChange={field.onChange}
                  renderOption={account => `${account.seq} ${account.names[language]}`}
                  getDisplayValue={account => account.names[language]}
                  getOptionValue={account => account.id}
                  triggerClassName="w-full"
                  disabled={isLoading || !cashregisterTo}
                  searchable
                  clearable
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={cashregisterForm.control}
            name="accountTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <p>
                    {t('page.money-transactions.form.cashregister-account-to')}
                    <span className="text-destructive ml-1">*</span>
                  </p>
                </FormLabel>
                <AsyncSelectMenu
                  loadSearchOptions={loadAccountToOptions}
                  loadSelectedOptions={loadAccountToSelected}
                  field={field}
                  value={field.value}
                  onChange={field.onChange}
                  renderOption={account => `${account.seq} ${account.names[language]}`}
                  getDisplayValue={account => account.names[language]}
                  getOptionValue={account => account.id}
                  triggerClassName="w-full"
                  disabled={isLoading || !accountFrom}
                  searchable
                  clearable
                />
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
              <div className="flex min-w-0 items-center gap-2">
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t('page.money-transactions.form.amount')}
                    className="min-w-0 flex-1"
                    {...field}
                    disabled={isLoading}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormField
                  control={cashregisterForm.control}
                  name="currency"
                  render={({ field: currencyField }) => (
                    <AsyncSelectMenu
                      loadSearchOptions={loadCurrencyOptions}
                      loadSelectedOptions={loadCurrencySelected}
                      field={currencyField}
                      value={currencyField.value}
                      onChange={currencyField.onChange}
                      renderOption={currency => currency.symbols[language]}
                      getDisplayValue={currency => currency.symbols[language]}
                      getOptionValue={currency => currency.id}
                      triggerClassName="w-20 min-w-20 max-w-20 shrink-0 overflow-hidden px-2"
                      placeholder="..."
                      disabled={isLoading || !accountTo}
                      clearable
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
          name="requiresReceiving"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <p>
                  {t('page.money-transactions.form.requiresReceiving')}
                </p>
              </FormLabel>
              <FormControl>
                <Switch
                  checked={field.value ?? true}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
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
