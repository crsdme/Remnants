import { useState } from 'react'
import { PermissionGate } from '@/components/PermissionGate'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
} from '@/components/ui'
import { formatDate, formatMinor } from '@/utils/helpers'
import { useLocale } from '@/utils/hooks'
import { useProfileContext } from '../context'

function initials(name?: string) {
  if (!name)
    return '?'
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('')
}

function money(minor: number, symbol: string) {
  const amount = formatMinor(minor)
  return symbol ? `${amount} ${symbol}` : amount
}

export function ProfileCard() {
  const { t, language } = useLocale()
  const {
    summary,
    currencySymbol,
    canStart,
    isOwnProfile,
    startDay,
    finishDay,
    isMutating,
    isLoading,
  } = useProfileContext()

  const [confirmStartOpen, setConfirmStartOpen] = useState(false)
  const [confirmFinishOpen, setConfirmFinishOpen] = useState(false)

  const activeShift = summary?.activeShift
  const totals = summary?.totals
  const profile = summary?.profile
  const roleName = summary?.user.role?.names?.[language]
    || summary?.user.role?.names?.en
    || summary?.user.role?.names?.ru
    || '—'

  const scheduleLabel = profile?.defaultSchedule
    ? `${profile.defaultSchedule.start} – ${profile.defaultSchedule.end}`
    : t('page.profile.info.scheduleEmpty')

  const salaryModeLabel = profile
    ? t(`page.profile.salaryMode.${profile.salary.mode}`)
    : '—'

  return (
    <Card className="h-fit">
      <CardContent className="space-y-6 pt-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Avatar className="size-20 rounded-full">
            <AvatarFallback className="rounded-full text-xl">
              {initials(summary?.user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <h2 className="text-xl font-semibold">{summary?.user.name ?? '—'}</h2>
              {!isOwnProfile && (
                <Badge variant="secondary">{t('page.profile.badge.employee')}</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{roleName}</p>
            <p className="text-xs text-muted-foreground">{summary?.user.login}</p>
          </div>
        </div>

        <div className="space-y-3 rounded-md border p-4 text-sm">
          <InfoRow
            label={t('page.profile.info.hiredAt')}
            value={profile?.hiredAt
              ? formatDate(profile.hiredAt, 'dd.MM.yyyy', language)
              : '—'}
          />
          <InfoRow label={t('page.profile.info.schedule')} value={scheduleLabel} />
          <InfoRow
            label={t('page.profile.info.salary')}
            value={`${money(Number(profile?.salary.amountMinor) || 0, currencySymbol)} · ${salaryModeLabel}`}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Stat label={t('page.profile.totals.salary')} value={money(totals?.salaryMinor ?? 0, currencySymbol)} />
          <Stat label={t('page.profile.totals.early')} value={`+${money(totals?.earlyBonusMinor ?? 0, currencySymbol)}`} accent="green" />
          <Stat label={t('page.profile.totals.late')} value={`-${money(totals?.latePenaltyMinor ?? 0, currencySymbol)}`} accent="red" />
          <Stat label={t('page.profile.totals.adjustment')} value={money(totals?.adjustmentMinor ?? 0, currencySymbol)} />
        </div>

        <div className="rounded-md border bg-muted/30 px-4 py-3">
          <div className="text-sm text-muted-foreground">{t('page.profile.totals.total')}</div>
          <div className="text-2xl font-bold tracking-tight">
            {money(totals?.totalMinor ?? 0, currencySymbol)}
          </div>
        </div>

        <PermissionGate permission={['workShift.start', 'workShift.edit', 'other.admin']}>
          <div className="flex flex-col gap-2">
            <Button
              className="w-full"
              disabled={!canStart || isMutating || isLoading || activeShift?.status === 'started'}
              onClick={() => setConfirmStartOpen(true)}
            >
              {t('page.profile.actions.start')}
            </Button>
            <Button
              className="w-full"
              variant="secondary"
              disabled={!canStart || isMutating || isLoading || activeShift?.status !== 'started'}
              onClick={() => setConfirmFinishOpen(true)}
            >
              {t('page.profile.actions.finish')}
            </Button>
          </div>
        </PermissionGate>
      </CardContent>

      <AlertDialog open={confirmStartOpen} onOpenChange={setConfirmStartOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('page.profile.confirm.start.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('page.profile.confirm.start.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('button.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmStartOpen(false)
                void startDay()
              }}
            >
              {t('page.profile.actions.start')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmFinishOpen} onOpenChange={setConfirmFinishOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('page.profile.confirm.finish.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('page.profile.confirm.finish.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('button.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmFinishOpen(false)
                void finishDay()
              }}
            >
              {t('page.profile.actions.finish')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

function InfoRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: 'green' | 'red'
}) {
  return (
    <div className="rounded-md border px-3 py-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={[
        'mt-1 text-sm font-semibold',
        accent === 'green' ? 'text-green-600' : '',
        accent === 'red' ? 'text-red-600' : '',
      ].filter(Boolean).join(' ')}
      >
        {value}
      </div>
    </div>
  )
}
