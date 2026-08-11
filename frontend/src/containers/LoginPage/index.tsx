import { Helmet } from 'react-helmet'

import { LanguageButton, ThemeButton } from '@/components'
import { OfflineBanner } from '@/components/OfflineBanner'
import { LogoIcon } from '@/components/ui'

import { useLocale } from '@/utils/hooks'
import { LoginForm } from './components/login-form'

export function LoginPage() {
  const { t } = useLocale()

  return (
    <>
      <Helmet>
        <title>{t('title.page.login')}</title>
        <meta name="description" content={t('description.page.login')} />
      </Helmet>
      <div className="flex h-svh w-svw flex-col">
        <OfflineBanner />
        <div className="relative flex min-h-0 flex-1">
          <div className="relative hidden h-full w-1/2 flex-col bg-muted p-10 text-white dark:border-r lg:flex">
            <div className="absolute inset-0 bg-zinc-900"></div>
            <div className="relative z-20 flex items-center gap-4 text-lg font-medium">
              <LogoIcon className="size-6" />
              Remnant
            </div>
            <div className="relative z-20 mt-auto">
              <blockquote className="space-y-2">
                <p className="text-lg">{t('page.login.quote')}</p>
                <footer className="text-sm">{t('page.login.quote.author')}</footer>
              </blockquote>
            </div>
          </div>
          <div className="relative flex w-1/2 items-center justify-center max-lg:w-full">
            <LoginForm />
            <div className="absolute top-4 right-4 flex gap-2 md:top-8 md:right-8">
              <ThemeButton />
              <LanguageButton />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
