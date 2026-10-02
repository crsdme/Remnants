import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { useCashregisterAccountOptions, useCashregisterOptions, useCurrencyQuery } from '@/api/hooks'
import { AsyncSelectNew } from '@/components/AsyncSelectNew'
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Textarea,
} from '@/components/ui'
import { useAccountIdsWithCapability, useEntityIdsWithCapability, useLocale } from '@/utils/hooks'

export interface ProcurementPayFormValues {
  cashregister: string
  account: string
  currency: string
  amount: number
  comment?: string
}

interface ProcurementPaySheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  defaultAmount?: number
  defaultCurrencyId?: string
  availableCredit?: number
  availableCreditSymbol?: string
  isLoading?: boolean
  onSubmit: (values: ProcurementPayFormValues) => void
}

export function ProcurementPaySheet({
  open,
  onOpenChange,
  title,
  description,
  defaultAmount = 0,
  defaultCurrencyId = '',
  availableCredit = 0,
  availableCreditSymbol = '',
  isLoading,
  onSubmit,
}: ProcurementPaySheetProps) {
  const { t, language } = useLocale()
  const schema = useMemo(() => z.object({
    cashregister: z.string().min(1, t('form.errors.required')),
    account: z.string().min(1, t('form.errors.required')),
    currency: z.string().min(1, t('form.errors.required')),
    amount: z.number({ required_error: t('form.errors.required') }).positive(t('form.errors.required')),
    comment: z.string().optional(),
  }), [t])

  const form = useForm<ProcurementPayFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      cashregister: '',
      account: '',
      currency: '',
      amount: 0,
      comment: '',
    },
  })

  useEffect(() => {
    if (!open)
      return
    form.reset({
      cashregister: '',
      account: '',
      currency: defaultCurrencyId,
      amount: defaultAmount > 0 ? defaultAmount : 0,
      comment: '',
    })
  }, [defaultAmount, defaultCurrencyId, form, open])

  const selectedCashregister = useWatch({ control: form.control, name: 'cashregister' })
  const selectedAccount = useWatch({ control: form.control, name: 'account' })

  const transferAccountIds = useAccountIdsWithCapability('transfer')
  const transferCashregisterIds = useEntityIdsWithCapability('cashregisters', 'transfer')
  const loadCashregisterOptions = useCashregisterOptions()
  const loadTransferCashregisterOptions = useCallback(
    async (params?: { query?: string, selectedValue?: string[] }) => {
      const options = await loadCashregisterOptions(params)
      if (transferCashregisterIds == null)
        return options
      const allowed = new Set(transferCashregisterIds)
      return options.filter(option => allowed.has(option.id))
    },
    [loadCashregisterOptions, transferCashregisterIds],
  )
  const loadAccountOptions = useCashregisterAccountOptions({
    defaultFilters: {
      cashregister: selectedCashregister ? [selectedCashregister] : [],
      ...(transferAccountIds != null ? { ids: transferAccountIds } : {}),
    },
  })
  const { currencies } = useCurrencyQuery(
    {
      pagination: { full: true },
      filters: { cashregisterAccount: selectedAccount ? [selectedAccount] : [] },
    },
    { options: { enabled: Boolean(selectedAccount) } },
  )

  useEffect(() => {
    if (!selectedAccount || currencies.length === 0)
      return
    const current = form.getValues('currency')
    if (current && currencies.some(currency => currency.id === current))
      return
    const preferred = currencies.find(currency => currency.id === defaultCurrencyId) ?? currencies[0]
    if (preferred)
      form.setValue('currency', preferred.id)
  }, [currencies, defaultCurrencyId, form, selectedAccount])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl w-full overflow-y-auto" side="right">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="px-4 pb-4">
          {availableCredit > 0 && (
            <p className="mb-3 text-sm text-emerald-700">
              {t('page.procurements.pay.available-credit', {
                amount: availableCredit,
                symbol: availableCreditSymbol,
              })}
            </p>
          )}
          <Form {...form}>
            <form className="space-y-3" onSubmit={(e) => { void form.handleSubmit(onSubmit)(e) }}>
              <FormField
                control={form.control}
                name="cashregister"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('page.money-transactions.form.cashregister')}
                      <span className="text-destructive ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <AsyncSelectNew
                        {...field}
                        loadOptions={loadTransferCashregisterOptions}
                        renderOption={option => option.names[language]}
                        getDisplayValue={option => option.names[language]}
                        getOptionValue={option => option.id}
                        disabled={isLoading}
                        onChange={(value) => {
                          field.onChange(value)
                          form.setValue('account', '')
                          form.setValue('currency', '')
                        }}
                      />
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
                      {t('page.money-transactions.form.cashregister-account')}
                      <span className="text-destructive ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <AsyncSelectNew
                        key={selectedCashregister || 'no-cashregister'}
                        {...field}
                        loadOptions={loadAccountOptions}
                        renderOption={option => option.names[language]}
                        getDisplayValue={option => option.names[language]}
                        getOptionValue={option => option.id}
                        disabled={isLoading || !selectedCashregister}
                        onChange={(value) => {
                          field.onChange(value)
                          form.setValue('currency', defaultCurrencyId)
                        }}
                      />
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
                      {t('page.money-transactions.form.amount')}
                      <span className="text-destructive ml-1">*</span>
                    </FormLabel>
                    <div className="grid w-full grid-cols-[minmax(0,1fr)_5.5rem] items-center gap-2">
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder={t('page.money-transactions.form.amount')}
                          className="w-full"
                          name={field.name}
                          value={field.value || ''}
                          disabled={isLoading}
                          onBlur={field.onBlur}
                          onChange={event => field.onChange(event.target.value === '' ? 0 : Number(event.target.value))}
                        />
                      </FormControl>
                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field: currencyField }) => (
                          <Select
                            value={currencyField.value || undefined}
                            onValueChange={currencyField.onChange}
                            disabled={isLoading || !selectedAccount}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="..." />
                            </SelectTrigger>
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
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('page.money-transactions.form.description')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading} loading={isLoading}>
                {t('button.submit')}
              </Button>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
