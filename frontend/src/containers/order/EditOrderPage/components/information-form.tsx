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
import { hasPermission } from '@/utils/helpers'
import { useLocale } from '@/utils/hooks'
import { OrderCommentSection } from '../../components/OrderCommentSection'
import { OrderDeliverySection } from '../../components/OrderDeliverySection'
import { ORDER_INFORMATION_FORM_ID } from '../../components/OrderSidebar'
import { useEditOrderContext } from '../context'

export function InformationForm({ form, onSubmit }: { form: any, onSubmit: (payments: any) => void }) {
  const { t, language } = useLocale()
  const { isLoading, permissions } = useEditOrderContext()

  const loadWarehouseOptions = useWarehouseOptions()
  const loadOrderSourceOptions = useOrderSourceOptions()
  const loadOrderStatusOptions = useOrderStatusOptions({ defaultFilters: !hasPermission(permissions, 'order.editLocked') ? { isSelectable: true } : {} })
  const loadDeliveryServiceOptions = useDeliveryServiceOptions()

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        <ClipboardList className="size-5 shrink-0" />
        <p className="text-lg font-bold">{t('page.edit-order.information-form.title')}</p>
        <Separator className="flex-1" />
      </div>
      <Form {...form}>
        <form
          id={ORDER_INFORMATION_FORM_ID}
          onSubmit={(e) => { void form.handleSubmit(onSubmit)(e) }}
          className="space-y-3"
        >
          <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <FormField
              control={form.control}
              name="warehouse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <p>
                      {t('page.edit-order.form.warehouse')}
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
                      disabled={isLoading}
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
                      {t('page.edit-order.form.order-source')}
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
                      disabled={isLoading}
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
                      {t('page.edit-order.form.order-status')}
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
                      disabled={isLoading}
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
                      {t('page.edit-order.form.delivery-service')}
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
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <OrderCommentSection form={form} disabled={isLoading} />

          <OrderDeliverySection form={form} disabled={isLoading} />
        </form>
      </Form>
    </div>
  )
}
