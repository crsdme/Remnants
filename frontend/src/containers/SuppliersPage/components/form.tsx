import { TrashIcon } from 'lucide-react'
import { useFieldArray } from 'react-hook-form'

import { useTranslation } from 'react-i18next'
import {
  Button,
  Form,
  FormControl,
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
  Textarea,
} from '@/components/ui'
import { SOCIAL_TYPES } from '@/utils/constants'
import { useSupplierContext } from '../context'

export function SupplierForm() {
  const { t } = useTranslation()
  const { isLoading, form, closeModal, submitForm } = useSupplierContext()

  const onSubmit = (values) => {
    submitForm(values)
  }

  const { fields: phoneFields, append: appendPhone, remove: removePhone } = useFieldArray({
    control: form.control,
    name: 'phones',
  })

  const { fields: emailFields, append: appendEmail, remove: removeEmail } = useFieldArray({
    control: form.control,
    name: 'emails',
  })

  const { fields: socialsFields, append: appendSocial, remove: removeSocial } = useFieldArray({
    control: form.control,
    name: 'socials',
  })

  return (
    <Form {...form}>
      <form className="w-full space-y-1" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.suppliers.form.name')}</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} placeholder={t('page.suppliers.form.name')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>{t('page.suppliers.form.phones')}</FormLabel>

          {phoneFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2 mb-2">
              <Input
                {...form.register(`phones.${index}`)}
                placeholder={t('page.suppliers.form.phones')}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => removePhone(index)}
                disabled={isLoading}
              >
                <TrashIcon />
              </Button>
            </div>
          ))}

          <Button type="button" onClick={() => appendPhone('')} disabled={isLoading}>
            {t('button.add')}
          </Button>

          <FormMessage />
        </FormItem>

        <FormItem>
          <FormLabel>{t('page.suppliers.form.emails')}</FormLabel>

          {emailFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2 mb-2">
              <Input
                {...form.register(`emails.${index}`)}
                placeholder={t('page.suppliers.form.emails')}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => removeEmail(index)}
                disabled={isLoading}
              >
                <TrashIcon />
              </Button>
            </div>
          ))}

          <Button type="button" onClick={() => appendEmail('')} disabled={isLoading}>
            {t('button.add')}
          </Button>

          <FormMessage />
        </FormItem>

        <FormItem>
          <FormLabel>{t('page.suppliers.form.socials')}</FormLabel>
          {socialsFields.map((f, idx) => (
            <div key={f.id} className="flex items-center gap-2 mb-2">
              <FormField
                control={form.control}
                name={`socials.${idx}.type`}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder={t('page.suppliers.form.socials.type')} />
                    </SelectTrigger>
                    <SelectContent>
                      {SOCIAL_TYPES.map(social => (
                        <SelectItem key={social.id} value={social.id}>
                          {t(`socials.type.${social.id}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />

              <FormField
                control={form.control}
                name={`socials.${idx}.value`}
                render={({ field }) => (
                  <Input
                    {...field}
                    className="flex-1"
                  />
                )}
              />

              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => removeSocial(idx)}
              >
                <TrashIcon />
              </Button>
            </div>
          ))}
          <FormMessage />
          <Button
            type="button"
            onClick={() => appendSocial({ type: 'telegram', value: '' })}
            className="w-full"
          >
            {t('button.add')}
          </Button>
        </FormItem>

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.suppliers.form.comment')}</FormLabel>
              <FormControl>
                <Textarea {...field} disabled={isLoading} placeholder={t('page.suppliers.form.comment')} />
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
