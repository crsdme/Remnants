import { useTranslation } from 'react-i18next'
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Textarea,
} from '@/components/ui'
import { useBalanceContext } from '../context'

export function BalanceForm() {
  const { t } = useTranslation()
  const { isLoading, form, closeModal, submitBalanceForm } = useBalanceContext()

  const onSubmit = (values) => {
    submitBalanceForm(values)
  }

  return (
    <Form {...form}>
      <form className="w-full space-y-1" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.clients.form.comment')}</FormLabel>
              <FormControl>
                <Textarea {...field} disabled={isLoading} placeholder={t('page.clients.form.comment')} />
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
