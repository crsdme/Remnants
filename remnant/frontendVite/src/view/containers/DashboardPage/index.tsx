import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useThemeContext, useAuthContext } from '@/utils/contexts';

export function DashboardPage() {
  const { t } = useTranslation();

  const themeContext = useThemeContext();

  const authContext = useAuthContext();

  return (
    <>
      <Helmet>
        <title>{t('title.dashboard')}</title>
        <meta name='description' content={t('description.dashboard')} />
      </Helmet>
      <h1>Dashboard</h1>
      <p onClick={() => themeContext.updateTheme({ language: 'ru' })}>RU</p>
      <p onClick={() => themeContext.updateTheme({ language: 'ua' })}>UA</p>
      <p onClick={() => themeContext.updateTheme({ language: 'en' })}>EN</p>
      <p onClick={() => authContext.logout()}>LOGOUT</p>
    </>
  );
}
