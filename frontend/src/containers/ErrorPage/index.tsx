import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function ErrorPage({ status }: { status: number }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <>
      <Helmet>
        <title>{t(`title.page.error.${status}`)}</title>
        <meta name="description" content={t(`description.page.error.${status}`)} />
      </Helmet>

      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <h1 className="text-4xl font-bold">{t(`page.error.title.${status}`)}</h1>
        <p className="text-lg text-muted-foreground">{t(`page.error.description.${status}`)}</p>
        <Button className="mt-4" onClick={() => navigate('/')}>
          {t('button.back')}
        </Button>
      </div>
    </>
  )
}
