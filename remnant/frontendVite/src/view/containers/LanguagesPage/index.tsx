import { Suspense } from 'react';

import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
// import { TableColumnsType, Space, Button } from 'antd';
import Navigation from './components/Navigation';
import Table from './components/Table';
import { LanguageProvider } from '@/utils/contexts';
import { Loading } from './loading';

export function LanguagesPage() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('title.dashboard')}</title>
        <meta name='description' content={t('description.dashboard')} />
      </Helmet>
      <Suspense fallback={<Loading />}>
        <LanguageProvider>
          <Navigation />
          <Table />
        </LanguageProvider>
      </Suspense>
    </>
  );
}
