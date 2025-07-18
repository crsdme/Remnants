import type { UseFormReturn } from 'react-hook-form'

import { useCallback } from 'react'
import { useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useCashregisterAccountOptions, useCashregisterOptions, useCurrencyOptions } from '@/api/hooks'
import { DatePicker } from '@/components'
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
import { useCreateOrderContext } from '@/contexts'
import { PAYMENT_STATUSES } from '@/utils/constants'

export function PaymentForm({ form, onSubmit }: { form: UseFormReturn, onSubmit: (payments: any) => void }) {
  const { t } = useTranslation()
  const { isPaymentModalOpen, closePaymentModal } = useCreateOrderContext()

  return (
    <Sheet open={isPaymentModalOpen} onOpenChange={closePaymentModal}>
      <SheetContent className="sm:max-w-xl w-full overflow-y-auto" side="right">
        <SheetHeader>
          <SheetTitle>
            {t(`page.create-order.form.title.payment`)}
          </SheetTitle>
          <SheetDescription>
            {t(`page.create-order.form.description.payment`)}
          </SheetDescription>
        </SheetHeader>
        <div className="w-full px-4">
          <FullForm form={form} onSubmit={onSubmit} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function FullForm({ form, onSubmit }: { form: UseFormReturn, onSubmit: (payments: any) => void }) {
  const { t, i18n } = useTranslation()
  const { isLoading } = useCreateOrderContext()

  const selectedCashregister = useWatch({ control: form.control, name: 'cashregister' })
  const selectedAccount = useWatch({ control: form.control, name: 'cashregisterAccount' })

  const loadCashregisterOptions = useCashregisterOptions()
  const loadCashregisterAccountOptions = useCallback(
    useCashregisterAccountOptions({
      defaultFilters: {
        cashregister: selectedCashregister ? [selectedCashregister] : [],
      },
    }),
    [selectedCashregister],
  )

  const loadCurrencyOptions = useCallback(
    useCurrencyOptions({
      defaultFilters: {
        cashregisterAccount: selectedAccount ? [selectedAccount] : [],
      },
    }),
    [selectedAccount],
  )

  return (
    <div className="flex flex-col gap-4 flex-1">
      <Form {...form}>
        <form onSubmit={onSubmit}>
          <div className="flex gap-2 w-full">
            <FormField
              control={form.control}
              name="cashregister"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t('page.create-order.form.cashregister')}</FormLabel>
                  <FormControl>
                    <AsyncSelectNew
                      {...field}
                      loadOptions={loadCashregisterOptions}
                      renderOption={e => e.names[i18n.language]}
                      getDisplayValue={e => e.names[i18n.language]}
                      getOptionValue={e => e.id}
                      disabled={isLoading}
                      onChange={(e) => {
                        field.onChange(e)
                        form.setValue('cashregisterAccount', '')
                        form.setValue('currency', '')
                      }}
                      name="cashregister"
                      clearable
                      selectFirstOption
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cashregisterAccount"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t('page.create-order.form.cashregister-account')}</FormLabel>
                  <FormControl>
                    <AsyncSelectNew
                      {...field}
                      loadOptions={loadCashregisterAccountOptions}
                      renderOption={e => e.names[i18n.language]}
                      getDisplayValue={e => e.names[i18n.language]}
                      getOptionValue={e => e.id}
                      disabled={isLoading || !selectedCashregister}
                      onChange={(e) => {
                        field.onChange(e)
                        form.setValue('currency', '')
                      }}
                      name="cashregisterAccount"
                      clearable
                      selectFirstOption
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('page.create-order.form.amount')}</FormLabel>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t('page.create-order.form.amount')}
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
                      <AsyncSelectNew
                        {...currencyField}
                        loadOptions={loadCurrencyOptions}
                        renderOption={e => e.symbols[i18n.language]}
                        getDisplayValue={e => e.symbols[i18n.language]}
                        getOptionValue={e => e.id}
                        disabled={isLoading || !selectedAccount}
                        clearable
                        selectFirstOption
                      />
                    )}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2 w-full">
            <FormField
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t('page.create-order.form.payment-date')}</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentStatus"
              render={({ field: currencyField }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t('page.create-order.form.payment-status')}</FormLabel>
                  <Select
                    value={currencyField.value}
                    onValueChange={currencyField.onChange}
                    disabled={isLoading}
                    {...currencyField}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('page.create-order.form.payment-status')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PAYMENT_STATUSES.map(status => (
                        <SelectItem key={status.id} value={status.id}>
                          {t(`payment-status.${status.id}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('page.create-order.form.comment')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('page.create-order.form.comment')}
                    className="w-full"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isLoading} loading={isLoading}>
              {t('button.submit')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
