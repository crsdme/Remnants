import { Suspense } from 'react';

import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

import { Loading } from './loading';
import Table from './components/Table';
import Navigation from './components/Navigation';

import { CategoryProvider } from '@/utils/contexts';

export function CategoriesPage() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('title.categoriespage')}</title>
        <meta name='description' content={t('description.categoriespage')} />
      </Helmet>
      <Suspense fallback={<Loading />}>
        <CategoryProvider>
          <Navigation />
          <Table />
        </CategoryProvider>
      </Suspense>
    </>
  );
}
