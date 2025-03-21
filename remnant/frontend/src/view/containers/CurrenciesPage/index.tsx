// import { Suspense } from 'react';
// import { Loading } from './loading';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

import { DataTable } from './components/data-table';
import { ActionBar } from './components/action-bar';

import { CurrencyProvider } from '@/utils/contexts';

export function CurrenciesPage() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('title.page.currencies')}</title>
        <meta name='description' content={t('description.page.currencies')} />
      </Helmet>
      {/* <Suspense fallback={<>Loading</>}> */}
      <CurrencyProvider>
        <div className='flex items-center justify-between flex-wrap'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>{t('page.currencies.title')}</h2>
            <p className='text-muted-foreground'>{t('page.currencies.description')}</p>
          </div>
          <ActionBar />
        </div>
        <DataTable />
      </CurrencyProvider>
      {/* </Suspense> */}
    </>
  );
}
