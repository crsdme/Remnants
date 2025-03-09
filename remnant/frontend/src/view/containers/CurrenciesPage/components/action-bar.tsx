import { Upload, Download, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/view/components/ui/dialog';

import {
  Button,
  Input,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Checkbox
} from '@/view/components/ui/';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRequestLanguages } from '@/api/hooks';
import { DialogDescription } from '@radix-ui/react-dialog';
import { useCurrencyContext } from '@/utils/contexts';

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
  }, [currencyContext.selectedCurrency, form]);

  return (
    <div className='flex items-center flex-wrap py-4 gap-2'>
      <Button variant='outline'>
        <Download /> {t('actionbar.export')}
      </Button>
      <Button>
        <Upload /> {t('actionbar.import')}
      </Button>
      <Dialog open={currencyContext.isModalOpen} onOpenChange={() => currencyContext.toggleModal()}>
        <DialogTrigger asChild>
          <Button onClick={() => currencyContext.toggleModal()}>
            <Plus /> {t('actionbar.create')}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('actionbar.modal.title.create')}</DialogTitle>
            <DialogDescription>{t('actionbar.modal.title.create')}</DialogDescription>
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
                      <FormLabel>{t(`currencypage.form.names.${language.code}`)}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t(`currencypage.form.names.${language.code}`)}
                          className='w-full'
                          {...field}
                          ref={null}
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
                      <FormLabel>{t(`currencypage.form.symbols.${language.code}`)}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t(`currencypage.form.symbols.${language.code}`)}
                          className='w-full'
                          {...field}
                          ref={null}
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
                    <FormLabel>{t('currencypage.form.priority')}</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder={t('currencypage.form.priority')}
                        className='w-full'
                        {...field}
                        ref={null}
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
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel>{t('currencypage.form.active')}</FormLabel>
                  </FormItem>
                )}
              />
              <div className='flex gap-2'>
                <Button variant='secondary' onClick={() => currencyContext.toggleModal()}>
                  {t('currencypage.form.cancel')}
                </Button>
                <Button type='submit'>{t('currencypage.form.submit')}</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
