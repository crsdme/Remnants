import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/components/ui'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuthContext } from '@/utils/contexts'

import { cn } from '@/utils/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const authContenxt = useAuthContext()
  const { t } = useTranslation()

  const formSchema = useMemo(() =>
    z.object({
      login: z.string({ required_error: t('form.errors.required') }).min(5, { message: t('form.errors.min_length', { count: 5 }) }).max(20, { message: t('form.errors.max_length', { count: 20 }) }),
      password: z.string({ required_error: t('form.errors.required') }).min(5, { message: t('form.errors.min_length', { count: 5 }) }).max(20, { message: t('form.errors.max_length', { count: 20 }) }),
      type: z.string({ required_error: t('form.errors.required') }).min(5, { message: t('form.errors.min_length', { count: 5 }) }).max(20, { message: t('form.errors.max_length', { count: 20 }) }),
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
    <div className={cn('flex flex-col gap-4', className)} {...props}>
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold text-center">Login to your account</h1>
        <p className="text-balance text-sm text-muted-foreground text-center">Enter your email below to login to your account</p>
      </div>
      <Form {...form}>
        <form className="w-full space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="login"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('page.login.form.label.login')}</FormLabel>
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
                <FormLabel>{t('page.login.form.label.password')}</FormLabel>
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
                <FormLabel>{t('page.login.select.label.type')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl className="w-full">
                    <SelectTrigger>
                      <SelectValue placeholder={t('page.login.select.label.type')} />
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
    </div>
  )
}
