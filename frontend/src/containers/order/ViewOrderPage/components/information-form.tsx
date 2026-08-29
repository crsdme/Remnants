import type { UseFormReturn } from 'react-hook-form'

import { ClipboardList } from 'lucide-react'
import { useDeliveryServiceOptions, useOrderSourceOptions, useOrderStatusOptions, useWarehouseOptions } from '@/api/hooks'
import { AsyncSelectNew } from '@/components/AsyncSelectNew'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Separator,
} from '@/components/ui'
import { useLocale } from '@/utils/hooks'
import { OrderCommentSection } from '../../components/OrderCommentSection'
import { OrderDeliverySection } from '../../components/OrderDeliverySection'
import { ORDER_INFORMATION_FORM_ID } from '../../components/OrderSidebar'
import { useViewOrderContext } from '../context'

export function InformationForm({ form, onSubmit }: { form: UseFormReturn<any>, onSubmit: (payments: any) => void }) {
  const { t, language } = useLocale()
  const { isLoading, disabled } = useViewOrderContext()

  const loadWarehouseOptions = useWarehouseOptions()
  const loadOrderSourceOptions = useOrderSourceOptions()
  const loadOrderStatusOptions = useOrderStatusOptions()
  const loadDeliveryServiceOptions = useDeliveryServiceOptions()

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        <ClipboardList className="size-5 shrink-0" />
        <p className="text-lg font-bold">{t('page.view-order.information-form.title')}</p>
        <Separator className="flex-1" />
      </div>
      <Form {...form}>
        <form id={ORDER_INFORMATION_FORM_ID} onSubmit={onSubmit} className="space-y-3">
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
                      renderOption={e => e.names[language]}
                      getDisplayValue={e => e.names[language]}
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
                      renderOption={e => e.names[language]}
                      getDisplayValue={e => e.names[language]}
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
                      renderOption={e => e.names[language]}
                      getDisplayValue={e => e.names[language]}
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
                      renderOption={e => e.names[language]}
                      getDisplayValue={e => e.names[language]}
                      getOptionValue={e => e.id}
                      disabled={isLoading || disabled}
                      selectFirstOption
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <OrderCommentSection form={form} disabled={isLoading || disabled} />

          <OrderDeliverySection form={form} disabled={isLoading || disabled} />
        </form>
      </Form>
    </div>
  )
}
