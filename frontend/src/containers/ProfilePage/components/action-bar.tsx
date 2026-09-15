import { Plus, Settings } from 'lucide-react'
import { PermissionGate } from '@/components/PermissionGate'
import { Button } from '@/components/ui'
import { useLocale } from '@/utils/hooks'
import { useProfileContext } from '../context'
import { ProfileAdjustmentSheet } from './adjustment-sheet'
import { ProfileSettingsSheet } from './settings-sheet'

export function ProfileActionBar() {
  const { t } = useLocale()
  const { setSettingsOpen, setAdjustmentOpen } = useProfileContext()

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('page.profile.title')}</h2>
          <p className="text-muted-foreground">{t('page.profile.description')}</p>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <PermissionGate permission={['userProfile.edit', 'other.admin']}>
            <Button variant="outline" onClick={() => setAdjustmentOpen(true)}>
              <Plus className="size-4" />
              {t('page.profile.adjustment.button')}
            </Button>
            <Button variant="outline" onClick={() => setSettingsOpen(true)}>
              <Settings className="size-4" />
              {t('page.profile.settings.title')}
            </Button>
          </PermissionGate>
        </div>
      </div>

      <ProfileSettingsSheet />
      <ProfileAdjustmentSheet />
    </>
  )
}
