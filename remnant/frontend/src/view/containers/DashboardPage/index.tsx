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

      <div className='flex flex-1 flex-col gap-4'>
        <div className='grid auto-rows-min gap-4 md:grid-cols-3'>
          <div className='aspect-video rounded-xl bg-muted/50' />
          <div className='aspect-video rounded-xl bg-muted/50' />
          <div className='aspect-video rounded-xl bg-muted/50' />
        </div>
        <div className='aspect-video rounded-xl bg-muted/50' />
      </div>
    </>
  );
}
