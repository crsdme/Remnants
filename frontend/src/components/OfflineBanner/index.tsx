import { useTranslation } from 'react-i18next'

import { useNetworkStatus } from '@/utils/hooks'

export function OfflineBanner() {
  const { t } = useTranslation()
  const { isOnline } = useNetworkStatus()

  if (isOnline)
    return null

  return (
    <div
      role="status"
      className="flex h-8 w-full shrink-0 items-center justify-center border-b border-destructive/20 bg-destructive/10 px-3 text-center text-sm text-destructive"
    >
      {t('network.offline')}
    </div>
  )
}
