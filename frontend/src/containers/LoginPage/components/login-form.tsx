import { zodResolver } from '@hookform/resolvers/zod'
import { Barcode, QrCode } from 'lucide-react'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'

import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Input,
} from '@/components/ui'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuthContext } from '@/utils/contexts'
import { cn } from '@/utils/lib/utils'

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const authContenxt = useAuthContext()
  const { t } = useTranslation()

  const formSchema = useMemo(() =>
    z.object({
      login: z.string({ required_error: t('form.errors.required') })
        .min(5, { message: t('form.errors.min_length', { count: 5 }) })
        .max(20, { message: t('form.errors.max_length', { count: 20 }) })
        .trim(),
      password: z.string({ required_error: t('form.errors.required') })
        .min(5, { message: t('form.errors.min_length', { count: 5 }) })
        .max(20, { message: t('form.errors.max_length', { count: 20 }) })
        .trim(),
      type: z.string({ required_error: t('form.errors.required') })
        .min(5, { message: t('form.errors.min_length', { count: 5 }) })
        .max(20, { message: t('form.errors.max_length', { count: 20 }) }),
    }), [t])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      login: '',
      password: '',
      type: 'guest',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    authContenxt.login(values)
  }
  return (
    <div className={cn('flex flex-col justify-center mx-auto gap-4 max-w-[360px] w-full px-4', className)} {...props}>
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold text-center">{t('page.login.form.title')}</h1>
        <p className="text-balance text-sm text-muted-foreground text-center">{t('page.login.form.description')}</p>
      </div>
      <Form {...form}>
        <form className="w-full space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="login"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder={t('page.login.form.label.login')}
                    className="w-full"
                    {...field}
                    ref={null}
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
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t('page.login.form.label.password')}
                    className="w-full"
                    {...field}
                    ref={null}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl className="w-full">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="guest">
                      {t('page.login.select.value.typeGuest')}
                    </SelectItem>
                    <SelectItem value="worker">
                      {t('page.login.select.value.typeWork')}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            {t('page.login.button.submit')}
          </Button>
        </form>
      </Form>
      <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
        <span className="relative z-10 bg-background px-2 text-muted-foreground">
          {t('page.login.or')}
        </span>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="w-[50%]">
          <Barcode className="mr-2 h-4 w-4" />
          {t('page.login.button.barcode.login')}
        </Button>
        <Button variant="outline" className="w-[50%]">
          <QrCode className="mr-2 h-4 w-4" />
          {t('page.login.button.qrcode.login')}
        </Button>
      </div>
    </div>
  )
}
