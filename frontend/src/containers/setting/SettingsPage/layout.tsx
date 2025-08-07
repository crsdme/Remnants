import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router-dom'

import { SettingProvider } from '@/contexts/SettingContext'

import { SettingsNav } from './components/settings-nav'

export function SettingsLayout() {
  const { t } = useTranslation()

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('page.settings.title')}</h2>
          <p className="text-muted-foreground">{t('page.settings.description')}</p>
        </div>
      </div>
      <div className="max-md:flex-col flex gap-4 mt-4">
        <SettingProvider>
          <SettingsNav />
          <Outlet />
        </SettingProvider>
      </div>
    </>
  )
}
