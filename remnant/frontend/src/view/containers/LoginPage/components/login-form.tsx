import { cn } from '@/utils/lib/utils';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Input,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/view/components/ui/';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/view/components/ui/card';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/view/components/ui/select';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useAuthContext } from '@/utils/contexts';

const formSchema = z.object({
  login: z.string().min(2).max(50),
  password: z.string().min(2).max(50),
  type: z.string().min(2).max(50)
});

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const authContenxt = useAuthContext();
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      login: '',
      password: ''
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    authContenxt.login(values);
  }
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className='text-center'>
          <CardTitle className='text-xl'>{t('loginPage.loginForm.loginTitle')}</CardTitle>
          <CardDescription>{t('loginPage.loginForm.loginDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className='w-full space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name='login'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('loginPage.loginForm.loginTitle')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('loginPage.loginForm.loginTitle')}
                        className='w-full'
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
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('loginPage.loginForm.PasswordTitle')}</FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder={t('loginPage.loginForm.PasswordTitle')}
                        className='w-full'
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
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('loginPage.loginForm.typeTitle')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl className='w-full'>
                        <SelectTrigger>
                          <SelectValue placeholder={t('loginPage.loginForm.typeTitle')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='guest'>
                          {t('loginPage.loginForm.typeSelect.guest')}
                        </SelectItem>
                        <SelectItem value='worker'>
                          {t('loginPage.loginForm.typeSelect.worker')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type='submit' className='w-full'>
                {t('loginPage.loginForm.submit')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
