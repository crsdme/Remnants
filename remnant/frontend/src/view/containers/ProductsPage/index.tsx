import { Suspense } from 'react';

import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import Navigation from './components/Navigation';
import Table from './components/Table';
import { ProductProvider } from '@/utils/contexts';
import { Loading } from './loading';

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
