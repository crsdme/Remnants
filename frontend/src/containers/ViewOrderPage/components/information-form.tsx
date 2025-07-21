import type { UseFormReturn } from 'react-hook-form'

import { Trash2Icon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
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
import { useViewOrderContext } from '@/contexts'
import { formatDate } from '@/utils/helpers/formatDate'

export function InformationForm({ form, onSubmit }: { form: UseFormReturn, onSubmit: (payments: any) => void }) {
  const { t, i18n } = useTranslation()
  const { isLoading, payments, disabled } = useViewOrderContext()
  const navigate = useNavigate()

  const loadWarehouseOptions = useWarehouseOptions()
  const loadOrderSourceOptions = useOrderSourceOptions()
  const loadOrderStatusOptions = useOrderStatusOptions({ defaultFilters: { isSelectable: true } })
  const loadDeliveryServiceOptions = useDeliveryServiceOptions()
  const loadClientsOptions = useClientOptions()

  return (
    <div className="flex flex-col gap-4 flex-1">
      <div className="flex items-center gap-2">
        <p className="text-lg font-bold">{t('page.view-order.information-form.title')}</p>
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
                      {t('page.view-order.form.warehouse')}
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
                      disabled={isLoading || disabled}
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
                      {t('page.view-order.form.order-source')}
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
                      disabled={isLoading || disabled}
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
                      {t('page.view-order.form.order-status')}
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
                      disabled={isLoading || disabled}
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
                      {t('page.view-order.form.delivery-service')}
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
                      disabled={isLoading || disabled}
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
                    {t('page.view-order.form.client')}
                  </FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <AsyncSelectNew
                        {...field}
                        loadOptions={loadClientsOptions}
                        renderOption={e => `${e.name} ${e.middleName} ${e.lastName} (${e.emails.join(', ')}) (${e.phones.join(', ')})`}
                        getDisplayValue={e => `${e.name} ${e.middleName} ${e.lastName} (${e.emails.join(', ')}) (${e.phones.join(', ')})`}
                        getOptionValue={e => e.id}
                        disabled={isLoading || disabled}
                        clearable
                      />
                    </FormControl>
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
                <FormLabel>{t('page.view-order.form.comment')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('page.view-order.form.comment')}
                    className="w-full"
                    {...field}
                    disabled={isLoading || disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-2">
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
                    onClick={() => {}}
                    disabled={isLoading || disabled}
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </Button>
                </div>
              )
            })}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" disabled={isLoading} loading={isLoading} onClick={() => navigate('/orders')}>
              {t('button.back')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
