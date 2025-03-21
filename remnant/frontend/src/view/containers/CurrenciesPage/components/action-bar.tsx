import { useEffect } from 'react';

import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Pencil, Plus, Loader2 } from 'lucide-react';
import { DialogDescription } from '@radix-ui/react-dialog';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/view/components/ui/dialog';
import {
  Button,
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input
} from '@/view/components/ui/';
import { useCurrencyContext } from '@/utils/contexts';
import { useRequestLanguages } from '@/api/hooks';

const formSchema = z.object({
  names: z.record(z.string()),
  symbols: z.record(z.string()),
  priority: z.number().default(0),
  active: z.boolean().default(true)
});

export function ActionBar() {
  const { t } = useTranslation();
  const currencyContext = useCurrencyContext();

  const requestLanguages = useRequestLanguages({ pagination: { full: true } });
  const languages = requestLanguages.data.data.languages;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      names: {},
      symbols: {},
      priority: 0,
      active: true
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    currencyContext.submitCurrencyForm(values);
  }

  useEffect(() => {
    const currency = currencyContext.selectedCurrency;
    let currencyValues = {};
    if (currency) {
      currencyValues = {
        names: { ...currency.names },
        symbols: { ...currency.symbols },
        priority: currency.priority,
        active: currency.active
      };
    }

    form.reset(currencyValues);
  }, [currencyContext.selectedCurrency, form, currencyContext.isModalOpen]);

  const isLoading = currencyContext.isLoading;

  return (
    <div className='flex items-center flex-wrap gap-2'>
      <Button variant='outline' disabled={isLoading}>
        <Pencil /> {t('page.currencies.button.batchedit')}
      </Button>
      <Dialog
        open={currencyContext.isModalOpen}
        onOpenChange={() => !isLoading && currencyContext.toggleModal()}
      >
        <DialogTrigger asChild>
          <Button onClick={() => currencyContext.toggleModal()} disabled={isLoading}>
            <Plus /> {t('page.currencies.button.create')}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('page.currencies.modal.title.create')}</DialogTitle>
            <DialogDescription>{t('page.currencies.modal.description.create')}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className='w-full space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
              {languages.map((language, key) => (
                <FormField
                  control={form.control}
                  key={key}
                  name={`names.${language.code}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('page.currencies.form.names', {
                          language: t(`language.${language.code}`)
                        })}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('page.currencies.form.names', {
                            language: t(`language.${language.code}`)
                          })}
                          className='w-full'
                          {...field}
                          ref={null}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              {languages.map((language, key) => (
                <FormField
                  control={form.control}
                  key={key}
                  name={`symbols.${language.code}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('page.currencies.form.symbols', {
                          language: t(`language.${language.code}`)
                        })}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('page.currencies.form.symbols', {
                            language: t(`language.${language.code}`)
                          })}
                          className='w-full'
                          {...field}
                          ref={null}
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
                name='priority'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('page.currencies.form.priority')}</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder={t('page.currencies.form.priority')}
                        className='w-full'
                        {...field}
                        ref={null}
                        disabled={isLoading}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='active'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormLabel>{t('page.currencies.form.active')}</FormLabel>
                  </FormItem>
                )}
              />
              <div className='flex gap-2'>
                <Button
                  variant='secondary'
                  onClick={() => currencyContext.toggleModal()}
                  disabled={isLoading}
                >
                  {t('page.currencies.button.cancel')}
                </Button>
                <Button type='submit' disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      {t('page.currencies.button.loading')}
                    </>
                  ) : (
                    t('page.currencies.button.submit')
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
