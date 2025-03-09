import { Suspense } from 'react';

import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { CurrencyProvider } from '@/utils/contexts';
import { Loading } from './loading';

import { ActionBar } from './components/action-bar';
import { DataTable } from './components/data-table';

export function CurrenciesPage() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('title.currencyspage')}</title>
        <meta name='description' content={t('description.currencyspage')} />
      </Helmet>
      <Suspense fallback={<Loading />}>
        <CurrencyProvider>
          <div className='flex items-center justify-between flex-wrap'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>Currencies</h2>
              <p className='text-muted-foreground'>Description</p>
            </div>
            <ActionBar />
          </div>
          <DataTable />
        </CurrencyProvider>
      </Suspense>
    </>
  );
}
