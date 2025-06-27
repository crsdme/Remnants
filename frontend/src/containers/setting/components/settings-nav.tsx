import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export function SettingsNav() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-2 w-96">
      <Link to="/settings/main" className="flex items-center gap-2 text-sm">
        <span>{t('page.settings.navigation.main')}</span>
      </Link>
    </div>
  )
}
