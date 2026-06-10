import { TrashIcon } from 'lucide-react'

import { useFieldArray } from 'react-hook-form'
import { CountrySelect } from '@/components/'
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Textarea,
} from '@/components/ui'
import { SOCIAL_TYPES } from '@/utils/constants'
import { useLocale } from '@/utils/hooks'
import { useCreateOrderContext } from '../context'

export function ClientForm() {
  const { t } = useLocale()
  const { isClientModalOpen, closeClientModal, clientForm, createClient } = useCreateOrderContext()

  return (
    <Sheet open={isClientModalOpen} onOpenChange={closeClientModal}>
      <SheetContent className="sm:max-w-xl w-full overflow-y-auto" side="right">
        <SheetHeader>
          <SheetTitle>
            {t(`page.create-order.form.title.client`)}
          </SheetTitle>
          <SheetDescription>
            {t(`page.create-order.form.description.client`)}
          </SheetDescription>
        </SheetHeader>
        <div className="w-full px-4">
          <FullForm form={clientForm} onSubmit={(e) => { void clientForm.handleSubmit(v => createClient(v))(e) }} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

function FullForm({ form, onSubmit }: { form: any, onSubmit: (payments: any) => void }) {
  const { t, language } = useLocale()
  const { isLoading } = useCreateOrderContext()

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
      <form onSubmit={onSubmit}>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.create-order.form.name')}</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} placeholder={t('page.create-order.form.name')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="middleName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.create-order.form.middleName')}</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} placeholder={t('page.create-order.form.middleName')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.create-order.form.lastName')}</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} placeholder={t('page.create-order.form.lastName')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('page.create-order.form.country')}</FormLabel>
              <FormControl>
                <CountrySelect locale={language} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>{t('page.create-order.form.phones')}</FormLabel>

          {phoneFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2 mb-2">
              <Input
                {...form.register(`phones.${index}`)}
                placeholder={t('page.create-order.form.phones')}
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
          <FormLabel>{t('page.create-order.form.emails')}</FormLabel>

          {emailFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2 mb-2">
              <Input
                {...form.register(`emails.${index}`)}
                placeholder={t('page.create-order.form.emails')}
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
          <FormLabel>{t('page.create-order.form.socials')}</FormLabel>
          {socialsFields.map((f, idx) => (
            <div key={f.id} className="flex items-center gap-2 mb-2">
              <FormField
                control={form.control}
                name={`socials.${idx}.type`}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder={t('page.create-order.form.socials.type')} />
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
              <FormLabel>{t('page.create-order.form.comment')}</FormLabel>
              <FormControl>
                <Textarea {...field} disabled={isLoading} placeholder={t('page.create-order.form.comment')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading} loading={isLoading}>
            {t('button.submit')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
