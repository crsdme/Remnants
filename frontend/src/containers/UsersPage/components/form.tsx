import {
  useCashregisterAccountOptions,
  useCashregisterOptions,
  useDeliveryServiceOptions,
  useExpenseCategoryOptions,
  useOrderSourceOptions,
  useOrderStatusOptions,
  useSiteOptions,
  useUserRoleOptions,
  useWarehouseOptions,
} from '@/api/hooks'
import { AsyncSelectNew } from '@/components/AsyncSelectNew'
import {
  Button,
  Checkbox,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/components/ui'
import { useLocale } from '@/utils/hooks'
import { useUserContext } from '../context'

export function UserForm() {
  const { t, language } = useLocale()
  const { isLoading, form, closeModal, submitUserForm } = useUserContext()

  const loadUserRolesOptions = useUserRoleOptions()
  const loadWarehouseOptions = useWarehouseOptions()
  const loadSiteOptions = useSiteOptions()
  const loadExpenseCategoryOptions = useExpenseCategoryOptions()
  const loadCashregisterOptions = useCashregisterOptions()
  const loadCashregisterAccountOptions = useCashregisterAccountOptions()
  const loadDeliveryServiceOptions = useDeliveryServiceOptions()
  const loadOrderSourceOptions = useOrderSourceOptions()
  const loadOrderStatusOptions = useOrderStatusOptions()

  return (
    <Form {...form}>
      <form
        className="w-full space-y-1"
        onSubmit={(e) => { void form.handleSubmit(submitUserForm)(e) }}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <p>
                  {t('page.users.form.name')}
                  <span className="text-destructive ml-1">*</span>
                </p>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t('page.users.form.name')}
                  className="w-full"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="login"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <p>
                  {t('page.users.form.login')}
                  <span className="text-destructive ml-1">*</span>
                </p>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t('page.users.form.login')}
                  className="w-full"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <p>
                  {t('page.users.form.password')}
                  <span className="text-destructive ml-1">*</span>
                </p>
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={t('page.users.form.password')}
                  className="w-full"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="roleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <p>
                  {t('page.users.form.role')}
                  <span className="text-destructive ml-1">*</span>
                </p>
              </FormLabel>
              <FormControl>
                <AsyncSelectNew
                  {...field}
                  loadOptions={loadUserRolesOptions}
                  renderOption={e => e.names[language]}
                  getDisplayValue={e => e.names[language]}
                  getOptionValue={e => e.id}
                  disabled={isLoading}
                  clearable
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="access.warehouseIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.users.form.access.warehouses')}</FormLabel>
              <FormControl>
                <AsyncSelectNew
                  {...field}
                  loadOptions={loadWarehouseOptions}
                  renderOption={e => e.names[language]}
                  getDisplayValue={e => e.names[language]}
                  getOptionValue={e => e.id}
                  disabled={isLoading}
                  clearable
                  multi
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="access.siteIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.users.form.access.sites')}</FormLabel>
              <FormControl>
                <AsyncSelectNew
                  {...field}
                  loadOptions={async (params) => {
                    return loadSiteOptions({
                      query: params?.query ?? '',
                      selectedValue: params?.selectedValue,
                    })
                  }}
                  renderOption={e => e.names[language]}
                  getDisplayValue={e => e.names[language]}
                  getOptionValue={e => e.id}
                  disabled={isLoading}
                  clearable
                  multi
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="access.expenseCategoryIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.users.form.access.expenseCategories')}</FormLabel>
              <FormControl>
                <AsyncSelectNew
                  {...field}
                  loadOptions={loadExpenseCategoryOptions}
                  renderOption={e => e.names[language]}
                  getDisplayValue={e => e.names[language]}
                  getOptionValue={e => e.id}
                  disabled={isLoading}
                  clearable
                  multi
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="access.cashregisterIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.users.form.access.cashregisters')}</FormLabel>
              <FormControl>
                <AsyncSelectNew
                  {...field}
                  loadOptions={loadCashregisterOptions}
                  renderOption={e => e.names[language]}
                  getDisplayValue={e => e.names[language]}
                  getOptionValue={e => e.id}
                  disabled={isLoading}
                  clearable
                  multi
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="access.cashregisterAccountIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.users.form.access.cashregisterAccounts')}</FormLabel>
              <FormControl>
                <AsyncSelectNew
                  {...field}
                  loadOptions={loadCashregisterAccountOptions}
                  renderOption={e => e.names[language]}
                  getDisplayValue={e => e.names[language]}
                  getOptionValue={e => e.id}
                  disabled={isLoading}
                  clearable
                  multi
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="access.deliveryServiceIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.users.form.access.deliveryServices')}</FormLabel>
              <FormControl>
                <AsyncSelectNew
                  {...field}
                  loadOptions={loadDeliveryServiceOptions}
                  renderOption={e => e.names[language]}
                  getDisplayValue={e => e.names[language]}
                  getOptionValue={e => e.id}
                  disabled={isLoading}
                  clearable
                  multi
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="access.orderSourceIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.users.form.access.orderSources')}</FormLabel>
              <FormControl>
                <AsyncSelectNew
                  {...field}
                  loadOptions={loadOrderSourceOptions}
                  renderOption={e => e.names[language]}
                  getDisplayValue={e => e.names[language]}
                  getOptionValue={e => e.id}
                  disabled={isLoading}
                  clearable
                  multi
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="access.orderStatusIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.users.form.access.orderStatuses')}</FormLabel>
              <FormControl>
                <AsyncSelectNew
                  {...field}
                  loadOptions={loadOrderStatusOptions}
                  renderOption={e => e.names[language]}
                  getDisplayValue={e => e.names[language]}
                  getOptionValue={e => e.id}
                  disabled={isLoading}
                  clearable
                  multi
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 flex-wrap pb-2">
          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-md border p-4 grow">
                <div className="space-y-1">
                  <FormLabel className="text-sm">{t('page.users.form.active')}</FormLabel>
                  <FormDescription className="text-xs text-muted-foreground">
                    {t('page.users.form.active.description')}
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
        </div>
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
