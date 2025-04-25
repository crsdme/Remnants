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
      <CurrencyProvider>
        <ActionBar />
        <DataTable />
      </CurrencyProvider>
    </>
  );
}
