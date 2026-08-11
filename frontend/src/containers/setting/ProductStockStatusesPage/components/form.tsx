import { Plus, Trash } from 'lucide-react'
import { useFieldArray } from 'react-hook-form'
import { useLanguageQuery } from '@/api/hooks'
import { ColorPicker } from '@/components'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { useLocale } from '@/utils/hooks'
import { useProductStockStatusContext } from '../context'

const CONDITION_FIELDS = ['qty', 'daysSinceLastSale', 'daysSinceQtyChange'] as const
const CONDITION_OPERATORS = ['eq', 'neq', 'lt', 'lte', 'gt', 'gte'] as const

export function ProductStockStatusForm() {
  const { t } = useLocale()
  const { isLoading, form, closeModal, submitProductStockStatusForm } = useProductStockStatusContext()

  const { languages = [] } = useLanguageQuery(
    { pagination: { full: true } },
    { options: { placeholderData: prevData => prevData } },
  )

  const conditionsField = useFieldArray({
    control: form.control,
    name: 'conditions',
  })

  return (
    <Form {...form}>
      <form
        className="w-full space-y-1"
        onSubmit={(e) => { void form.handleSubmit(submitProductStockStatusForm)(e) }}
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
                    {t('page.product-stock-statuses.form.names', {
                      language: t(`language.${language.code}`),
                    })}
                    <span className="text-destructive ml-1">*</span>
                  </p>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('page.product-stock-statuses.form.names', {
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
              <FormLabel>{t('page.product-stock-statuses.form.priority')}</FormLabel>
              <FormDescription className="text-xs text-muted-foreground">
                {t('page.product-stock-statuses.form.priority.description')}
              </FormDescription>
              <FormControl>
                <Input
                  type="number"
                  placeholder={t('page.product-stock-statuses.form.priority')}
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
          name="color"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <ColorPicker
                  ref={field.ref}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
              <FormLabel>{t('page.product-stock-statuses.form.color')}</FormLabel>
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
                  <FormLabel className="text-sm">{t('page.product-stock-statuses.form.active')}</FormLabel>
                  <FormDescription className="text-xs text-muted-foreground">
                    {t('page.product-stock-statuses.form.active.description')}
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
          <FormField
            control={form.control}
            name="isDefault"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-md border p-4 grow">
                <div className="space-y-1">
                  <FormLabel className="text-sm">{t('page.product-stock-statuses.form.isDefault')}</FormLabel>
                  <FormDescription className="text-xs text-muted-foreground">
                    {t('page.product-stock-statuses.form.isDefault.description')}
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

        <div className="space-y-2 rounded-md border p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium">{t('page.product-stock-statuses.form.conditions')}</p>
              <p className="text-xs text-muted-foreground">{t('page.product-stock-statuses.form.conditions.description')}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={() => conditionsField.append({ field: 'qty', operator: 'eq', value: 0 })}
            >
              <Plus className="h-4 w-4" />
              {t('page.product-stock-statuses.form.conditions.add')}
            </Button>
          </div>

          {conditionsField.fields.length === 0 && (
            <p className="text-xs text-muted-foreground">{t('page.product-stock-statuses.form.conditions.empty')}</p>
          )}

          {conditionsField.fields.map((item, index) => (
            <div key={item.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
              <FormField
                control={form.control}
                name={`conditions.${index}.field`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('page.product-stock-statuses.form.conditions.field')}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CONDITION_FIELDS.map(value => (
                          <SelectItem key={value} value={value}>
                            {t(`page.product-stock-statuses.condition.field.${value}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`conditions.${index}.operator`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('page.product-stock-statuses.form.conditions.operator')}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CONDITION_OPERATORS.map(value => (
                          <SelectItem key={value} value={value}>
                            {t(`page.product-stock-statuses.condition.operator.${value}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`conditions.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('page.product-stock-statuses.form.conditions.value')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        disabled={isLoading}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={isLoading}
                onClick={() => conditionsField.remove(index)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
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
