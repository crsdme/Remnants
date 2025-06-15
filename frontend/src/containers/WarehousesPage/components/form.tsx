import { useTranslation } from 'react-i18next'

import { useRequestLanguages } from '@/api/hooks'
import {
  Button,
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/components/ui'
import { useWarehouseContext } from '@/contexts'

export function WarehouseForm() {
  const warehouseContext = useWarehouseContext()
  const { t } = useTranslation()

  const { isLoading, form } = warehouseContext

  const requestLanguages = useRequestLanguages({ pagination: { full: true } })
  const languages = requestLanguages?.data?.data?.languages || []

  const onSubmit = (values) => {
    warehouseContext.submitWarehouseForm(values)
  }

  return (
    <Form {...form}>
      <form className="w-full space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        {languages.map(language => (
          <FormField
            control={form.control}
            key={language.code}
            name={`names.${language.code}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('page.warehouses.form.names', {
                    language: t(`language.${language.code}`),
                  })}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('page.warehouses.form.names', {
                      language: t(`language.${language.code}`),
                    })}
                    className="w-full"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.warehouses.form.priority')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={t('page.warehouses.form.priority')}
                  className="w-full"
                  {...field}
                  disabled={isLoading}
                  onChange={e => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
              <FormLabel>{t('page.warehouses.form.active')}</FormLabel>
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => warehouseContext.closeModal()}
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
