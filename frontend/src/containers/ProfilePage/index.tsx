import { Helmet } from 'react-helmet'
import { useLocale } from '@/utils/hooks'
import { ProfileActionBar } from './components/action-bar'
import { ProfileDaySheet } from './components/day-sheet'
import { ProfileMonthCalendar } from './components/month-calendar'
import { ProfileCard } from './components/profile-card'
import { ProfileProvider } from './context'

export function ProfilePage() {
  const { t } = useLocale()

  return (
    <ProfileProvider>
      <Helmet>
        <title>{t('title.page.profile')}</title>
        <meta name="description" content={t('description.page.profile')} />
      </Helmet>

      <div className="flex flex-1 flex-col gap-4">
        <ProfileActionBar />

        <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
          <ProfileCard />
          <ProfileMonthCalendar />
        </div>
      </div>

      <ProfileDaySheet />
    </ProfileProvider>
  )
}
