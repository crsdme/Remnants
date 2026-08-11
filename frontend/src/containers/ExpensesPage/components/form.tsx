import { useCallback } from 'react'

import { useWatch } from 'react-hook-form'
import { useCashregisterAccountOptions, useCashregisterOptions, useCurrencyOptions, useExpenseCategoryOptions } from '@/api/hooks'
import { AsyncSelectNew } from '@/components/AsyncSelectNew'
import { FileUploadDnd, ORDER_FILE_ACCEPT } from '@/components/FileUploadDnd'
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
} from '@/components/ui'
import { useLocale } from '@/utils/hooks'
import { useExpenseContext } from '../context'

export function ExpenseForm() {
  const { t, language } = useLocale()
  const { isLoading, isEdit, selectedExpense, form, files, setFiles, closeModal, submitExpenseForm } = useExpenseContext()

  const selectedCashregister = useWatch({ control: form.control, name: 'cashregister' })
  const selectedAccount = useWatch({ control: form.control, name: 'cashregisterAccount' })

  const loadCashregisterOptions = useCashregisterOptions()
  const loadExpenseCategoryOptions = useExpenseCategoryOptions()
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
    <Form {...form}>
      <form
        className="w-full space-y-1"
        onSubmit={(e) => { void form.handleSubmit(submitExpenseForm)(e) }}
      >
        <div className="flex gap-2 w-full">
          <FormField
            control={form.control}
            name="cashregister"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>
                  {t('page.expenses.form.cashregister')}
                  <span className="text-destructive ml-1">*</span>
                </FormLabel>
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
                    selectFirstOption={!isEdit}
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
                <FormLabel>
                  {t('page.expenses.form.cashregisterAccount')}
                  <span className="text-destructive ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <AsyncSelectNew
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
                    selectFirstOption={!isEdit}
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
              <FormLabel>
                {t('page.expenses.form.amount')}
                <span className="text-destructive ml-1">*</span>
              </FormLabel>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t('page.expenses.form.amount')}
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
                      {...currencyField}
                      loadOptions={loadCurrencyOptions}
                      renderOption={e => e.symbols[language]}
                      getDisplayValue={e => e.symbols[language]}
                      getOptionValue={e => e.id}
                      disabled={isLoading || !selectedAccount}
                      clearable
                      triggerClassName="flex-1 max-w-[80px]"
                      selectFirstOption={!isEdit}
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
          name="categories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('page.expenses.form.categories')}
                <span className="text-destructive ml-1">*</span>
              </FormLabel>
              <div className="flex items-center gap-2">
                <FormControl>
                  <AsyncSelectNew
                    {...field}
                    loadOptions={loadExpenseCategoryOptions}
                    renderOption={e => e.names[language]}
                    getDisplayValue={e => e.names[language]}
                    getOptionValue={e => e.id}
                    disabled={isLoading}
                    searchable
                    clearable
                    triggerClassName="flex-1"
                    multi
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2 pt-1 pb-5">
          <p className="text-sm font-medium leading-none">
            {t('page.expenses.form.files')}
          </p>
          <FileUploadDnd
            key={selectedExpense?.id ?? 'new-expense'}
            files={files}
            setFiles={setFiles}
            isLoading={isLoading}
            variant="button"
            accept={ORDER_FILE_ACCEPT}
            maxSizeMb={10}
            hint={t('page.expenses.form.files-hint')}
          />
        </div>

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.expenses.form.comment')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('page.expenses.form.comment')}
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
