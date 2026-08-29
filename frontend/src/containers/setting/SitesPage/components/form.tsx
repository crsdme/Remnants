import { useLanguageQuery, useWarehouseOptions } from '@/api/hooks'
import { PermissionGate } from '@/components'
import { AsyncSelectNew } from '@/components/AsyncSelectNew'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
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
import { useSiteContext } from '../context'

export function SiteForm() {
  const { t, language } = useLocale()
  const { isLoading, isSyncing, isEdit, form, closeModal, submitSiteForm, syncSiteProducts } = useSiteContext()

  const { languages = [] } = useLanguageQuery(
    { pagination: { full: true } },
    { options: { placeholderData: prevData => prevData } },
  )

  const loadWarehouseOptions = useWarehouseOptions()

  return (
    <Form {...form}>
      <form
        className="w-full space-y-1"
        onSubmit={(e) => { void form.handleSubmit(submitSiteForm)(e) }}
      >
        {languages.map(language => (
          <FormField
            control={form.control}
            key={language.code}
            name={`names.${language.code}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <p>
                    {t('page.sites.form.names', {
                      language: t(`language.${language.code}`),
                    })}
                    <span className="text-destructive ml-1">*</span>
                  </p>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('page.sites.form.names', {
                      language: t(`language.${language.code}`),
                    })}
                    className="w-full"
                    {...field}
                    value={field.value || ''}
                    disabled={isLoading || isSyncing}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.sites.form.url')}</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} placeholder={t('page.sites.form.url')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="key"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.sites.form.key')}</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} placeholder={t('page.sites.form.key')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="warehouseIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.sites.form.warehouses')}</FormLabel>
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
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.sites.form.priority')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  disabled={isLoading}
                  placeholder={t('page.sites.form.priority')}
                  onChange={e => field.onChange(Number(e.target.value))}
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
                  <FormLabel className="text-sm">{t('page.sites.form.active')}</FormLabel>
                  <FormDescription className="text-xs text-muted-foreground">
                    {t('page.sites.form.active.description')}
                  </FormDescription>
                </div>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading || isSyncing}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {isEdit && (
          <PermissionGate permission="site.sync">
            <div className="flex items-center justify-between rounded-md border p-4 mb-2">
              <div className="space-y-1 pr-4">
                <p className="text-sm font-medium">{t('page.sites.form.syncProducts')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('page.sites.form.syncProducts.description')}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="outline" disabled={isLoading || isSyncing} loading={isSyncing}>
                    {t('page.sites.form.syncProducts.button')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('page.sites.form.syncProducts.confirmTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('page.sites.form.syncProducts.confirmDescription')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isSyncing}>{t('button.cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                      disabled={isSyncing}
                      onClick={() => syncSiteProducts()}
                    >
                      {t('page.sites.form.syncProducts.button')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </PermissionGate>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => closeModal()}
            disabled={isLoading || isSyncing}
          >
            {t('button.cancel')}
          </Button>
          <Button type="submit" disabled={isLoading || isSyncing} loading={isLoading}>
            {t('button.submit')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
