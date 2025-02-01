import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

export function DashboardPage() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('title.dashboard')}</title>
        <meta name='description' content={t('description.dashboard')} />
      </Helmet>
      <h1>Dashboard</h1>
    </>
  );
}
