import { Suspense } from 'react';

import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

import { Loading } from './loading';
import Table from './components/Table';
import Navigation from './components/Navigation';

import { UnitProvider } from '@/utils/contexts';

export function UnitsPage() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('title.unitspage')}</title>
        <meta name='description' content={t('description.unitspage')} />
      </Helmet>
      <Suspense fallback={<Loading />}>
        <UnitProvider>
          <Navigation />
          <Table />
        </UnitProvider>
      </Suspense>
    </>
  );
}
