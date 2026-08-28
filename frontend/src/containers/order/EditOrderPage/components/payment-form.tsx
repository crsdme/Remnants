import type { UseFormReturn } from 'react-hook-form'

import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Textarea,
} from '@/components/ui'
import { useLocale } from '@/utils/hooks'
import { useEditOrderContext } from '../context'

export function PaymentForm({ form, onSubmit }: { form: any, onSubmit: (payments: any) => void }) {
  const { t } = useLocale()
  const { isPaymentModalOpen, closePaymentModal } = useEditOrderContext()

  return (
    <Sheet open={isPaymentModalOpen} onOpenChange={closePaymentModal}>
      <SheetContent className="sm:max-w-xl w-full overflow-y-auto" side="right">
        <SheetHeader>
          <SheetTitle>
            {t(`page.edit-order.form.title.payment`)}
          </SheetTitle>
          <SheetDescription>
            {t(`page.edit-order.form.description.payment`)}
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
  const { t, language } = useLocale()
  const { isLoading } = useEditOrderContext()

  const selectedCashregister = useWatch({ control: form.control, name: 'cashregister' })
  const selectedAccount = useWatch({ control: form.control, name: 'cashregisterAccount' })

  const accountFilters = useMemo(
    () => ({ cashregister: selectedCashregister ? [selectedCashregister] : [] }),
    [selectedCashregister],
  )
  const currencyFilters = useMemo(
    () => ({ cashregisterAccount: selectedAccount ? [selectedAccount] : [] }),
    [selectedAccount],
  )

  const loadCashregisterOptions = useCashregisterOptions()
  const loadCashregisterAccountOptions = useCashregisterAccountOptions({ defaultFilters: accountFilters })
  const loadCurrencyOptions = useCurrencyOptions({ defaultFilters: currencyFilters })

  return (
    <div className="flex flex-col gap-4 flex-1">
      <Form {...form}>
        <form
          onSubmit={(e) => { void form.handleSubmit(onSubmit)(e) }}
        >
          <div className="flex gap-2 w-full">
            <FormField
              control={form.control}
              name="cashregister"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t('page.edit-order.form.cashregister')}</FormLabel>
                  <FormControl>
                    <AsyncSelectNew
                      {...field}
                      loadOptions={loadCashregisterOptions}
                      renderOption={e => e.names[language]}
                      getDisplayValue={e => e.names[language]}
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
                  <FormLabel>{t('page.edit-order.form.cashregister-account')}</FormLabel>
                  <FormControl>
                    <AsyncSelectNew
                      key={selectedCashregister || 'no-cashregister'}
                      {...field}
                      loadOptions={loadCashregisterAccountOptions}
                      renderOption={e => e.names[language]}
                      getDisplayValue={e => e.names[language]}
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
                <FormLabel>{t('page.edit-order.form.amount')}</FormLabel>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t('page.edit-order.form.amount')}
                      className="flex-1"
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
                        key={selectedAccount || 'no-account'}
                        {...currencyField}
                        loadOptions={loadCurrencyOptions}
                        renderOption={e => e.symbols[language]}
                        getDisplayValue={e => e.symbols[language]}
                        getOptionValue={e => e.id}
                        disabled={isLoading || !selectedAccount}
                        clearable
                        triggerClassName="flex-1 max-w-[80px]"
                        selectFirstOption
                        placeholder="..."
                      />
                    )}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('page.edit-order.form.payment-date')}</FormLabel>
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
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('page.edit-order.form.comment')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('page.edit-order.form.comment')}
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
