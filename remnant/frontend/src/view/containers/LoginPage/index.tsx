import LogoIcon from '@/view/components/ui/icons/logoIcon'
import { Helmet } from 'react-helmet-async'

import { useTranslation } from 'react-i18next'

import { LoginForm } from './components/login-form'

export function LoginPage() {
  const { t } = useTranslation()

  return (
    <>
      <Helmet>
        <title>{t('title.page.login')}</title>
        <meta name="description" content={t('description.page.login')} />
      </Helmet>
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        <div className="flex items-center justify-center w-full max-w-sm gap-3">
          <div className="flex h-10 w-10 items-center justify-center">
            <LogoIcon />
          </div>
          <p className="flex items-center gap-2 self-center font-medium text-2xl">Remnant</p>
        </div>
        <LoginForm />
      </div>
    </>
  )
}
