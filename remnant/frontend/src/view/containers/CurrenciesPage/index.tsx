import { Suspense } from 'react';

import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import Navigation from './components/Navigation';
import Table from './components/Table';
import { CurrencyProvider } from '@/utils/contexts';
import { Loading } from './loading';

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
          <Navigation />
          <Table />
        </CurrencyProvider>
      </Suspense>
    </>
  );
}
