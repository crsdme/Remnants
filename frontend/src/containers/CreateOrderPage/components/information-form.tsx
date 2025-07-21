import type { UseFormReturn } from 'react-hook-form'

import { Trash2Icon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useClientOptions, useDeliveryServiceOptions, useOrderSourceOptions, useOrderStatusOptions, useWarehouseOptions } from '@/api/hooks'
import { AsyncSelectNew } from '@/components/AsyncSelectNew'
import {
  Badge,
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Separator,
  Textarea,
} from '@/components/ui'
import { useCreateOrderContext } from '@/contexts'
import { formatDate } from '@/utils/helpers/formatDate'

export function InformationForm({ form, onSubmit }: { form: UseFormReturn, onSubmit: (payments: any) => void }) {
  const { t, i18n } = useTranslation()
  const { isLoading, openClientModal, openPaymentModal, payments, removePayment } = useCreateOrderContext()

  const loadWarehouseOptions = useWarehouseOptions()
  const loadOrderSourceOptions = useOrderSourceOptions()
  const loadOrderStatusOptions = useOrderStatusOptions()
  const loadDeliveryServiceOptions = useDeliveryServiceOptions()
  const loadClientsOptions = useClientOptions()

  return (
    <div className="flex flex-col gap-4 flex-1">
      <div className="flex items-center gap-2">
        <p className="text-lg font-bold">{t('page.create-order.information-form.title')}</p>
        <Separator className="flex-1" />
      </div>
      <Form {...form}>
        <form onSubmit={onSubmit}>
          <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <FormField
              control={form.control}
              name="warehouse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <p>
                      {t('page.create-order.form.warehouse')}
                      <span className="text-destructive ml-1">*</span>
                    </p>
                  </FormLabel>
                  <FormControl>
                    <AsyncSelectNew
                      {...field}
                      loadOptions={loadWarehouseOptions}
                      renderOption={e => e.names[i18n.language]}
                      getDisplayValue={e => e.names[i18n.language]}
                      getOptionValue={e => e.id}
                      disabled={isLoading}
                      selectFirstOption
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="orderSource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <p>
                      {t('page.create-order.form.order-source')}
                      <span className="text-destructive ml-1">*</span>
                    </p>
                  </FormLabel>
                  <FormControl>
                    <AsyncSelectNew
                      {...field}
                      loadOptions={loadOrderSourceOptions}
                      renderOption={e => e.names[i18n.language]}
                      getDisplayValue={e => e.names[i18n.language]}
                      getOptionValue={e => e.id}
                      disabled={isLoading}
                      selectFirstOption
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="orderStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <p>
                      {t('page.create-order.form.order-status')}
                      <span className="text-destructive ml-1">*</span>
                    </p>
                  </FormLabel>
                  <FormControl>
                    <AsyncSelectNew
                      {...field}
                      loadOptions={loadOrderStatusOptions}
                      renderOption={e => e.names[i18n.language]}
                      getDisplayValue={e => e.names[i18n.language]}
                      getOptionValue={e => e.id}
                      disabled={isLoading}
                      selectFirstOption
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deliveryService"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <p>
                      {t('page.create-order.form.delivery-service')}
                      <span className="text-destructive ml-1">*</span>
                    </p>
                  </FormLabel>
                  <FormControl>
                    <AsyncSelectNew
                      {...field}
                      loadOptions={loadDeliveryServiceOptions}
                      renderOption={e => e.names[i18n.language]}
                      getDisplayValue={e => e.names[i18n.language]}
                      getOptionValue={e => e.id}
                      disabled={isLoading}
                      selectFirstOption
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="client"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('page.create-order.form.client')}
                  </FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <AsyncSelectNew
                        {...field}
                        loadOptions={loadClientsOptions}
                        renderOption={e => `${e.name} ${e.middleName} ${e.lastName} (${e.emails.join(', ')}) (${e.phones.join(', ')})`}
                        getDisplayValue={e => `${e.name} ${e.middleName} ${e.lastName} (${e.emails.join(', ')}) (${e.phones.join(', ')})`}
                        getOptionValue={e => e.id}
                        disabled={isLoading}
                        clearable
                      />
                    </FormControl>
                    <Button type="button" variant="outline" onClick={openClientModal}>{t('button.create')}</Button>
                  </div>
                  <FormMessage />
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

          <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-2">
            <div className="border-dashed border-2 border-gray-300 dark:border-gray-700 rounded-md p-10 cursor-pointer flex flex-col items-center justify-center" onClick={openPaymentModal}>
              <p className="text-lg font-bold">{t('page.create-order.form.add-payment')}</p>
              <p className="text-sm text-gray-500">{t('page.create-order.form.add-payment.description')}</p>
            </div>
            {payments.map((payment) => {
              return (
                <div key={payment.id} className="border border-gray-300 dark:border-gray-700 rounded-md p-2">
                  <div className="flex items-center flex-wrap gap-2">
                    <Badge variant="outline">{`${payment.amount} ${payment.currency.symbols[i18n.language]}`}</Badge>
                    <Badge variant="outline">{`${payment.cashregister.names[i18n.language]} | ${payment.cashregisterAccount.names[i18n.language]}`}</Badge>
                    <Badge variant="outline">{`${formatDate(payment.paymentDate, 'PPP')}`}</Badge>
                    <Badge variant="outline">{t(`payment-status.${payment.paymentStatus}`)}</Badge>
                    {payment.comment && <Badge variant="outline">{payment.comment}</Badge>}
                  </div>
                  <Button
                    className="mt-2"
                    variant="destructive"
                    size="icon"
                    onClick={() => removePayment(payment.id)}
                    disabled={isLoading}
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </Button>
                </div>
              )
            })}
          </div>

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
