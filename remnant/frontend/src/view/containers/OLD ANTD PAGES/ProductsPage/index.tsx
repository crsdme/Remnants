import { Suspense } from 'react';

import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

import { Loading } from './loading';
import Table from './components/Table';
import Navigation from './components/Navigation';

import { ProductProvider } from '@/utils/contexts';

export function ProductsPage() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('title.dashboard')}</title>
        <meta name='description' content={t('description.dashboard')} />
      </Helmet>
      <Suspense fallback={<Loading />}>
        <ProductProvider>
          <Navigation />
          <Table />
        </ProductProvider>
      </Suspense>
    </>
  );
}
