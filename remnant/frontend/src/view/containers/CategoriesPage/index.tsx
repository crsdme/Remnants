import { Suspense } from 'react';

import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import Navigation from './components/Navigation';
import Table from './components/Table';
import { CategoryProvider } from '@/utils/contexts';
import { Loading } from './loading';

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
