import { useAuthContext } from '@/utils/contexts'
import { cn } from '@/utils/lib/utils'
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/view/components/ui/'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/view/components/ui/card'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/view/components/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

const formSchema = z.object({
  login: z.string().min(2).max(50),
  password: z.string().min(2).max(50),
  type: z.string().min(2).max(50),
})

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const authContenxt = useAuthContext()
  const { t } = useTranslation()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      login: '',
      password: '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    authContenxt.login(values)
  }
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t('page.login.form.label.login')}</CardTitle>
          <CardDescription className="w-80">{t('page.login.form.description')}</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  )
}
