import { useMemo } from 'react'
import { PermissionGate } from '@/components/PermissionGate'
import {
  Badge,
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui'
import { formatMinor } from '@/utils/helpers'
import { useLocale } from '@/utils/hooks'
import { useProfileContext } from '../context'

function formatTime(value?: Date | string | null) {
  if (!value)
    return '—'
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime()))
    return '—'
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function ProfileDaySheet() {
  const { t } = useLocale()
  const {
    selectedDay,
    selectedShift,
    daySheetOpen,
    closeDaySheet,
    planDay,
    unplanDay,
    canPlan,
    isMutating,
    summary,
    currencySymbol,
  } = useProfileContext()

  const dayEntries = useMemo(
    () => (summary?.entries ?? []).filter(e => e.workDate === selectedDay),
    [summary?.entries, selectedDay],
  )

  const schedule = selectedShift?.plannedSchedule || summary?.profile.defaultSchedule

  return (
    <Sheet open={daySheetOpen} onOpenChange={(open) => { if (!open) closeDaySheet() }}>
      <SheetContent className="sm:max-w-xl w-full overflow-y-auto" side="right">
        <SheetHeader>
          <SheetTitle>{t('page.profile.day.title', { date: selectedDay ?? '' })}</SheetTitle>
          <SheetDescription>
            {selectedShift
              ? t('page.profile.day.description.existing')
              : t('page.profile.day.description.plan')}
          </SheetDescription>
        </SheetHeader>

        <div className="w-full space-y-4 px-4 pb-4">
          {!selectedShift && (
            <p className="text-sm text-muted-foreground">{t('page.profile.day.no-plan')}</p>
          )}

          {selectedShift && (
            <div className="space-y-4 rounded-md border p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">{t('page.profile.day.status')}</span>
                <Badge variant="outline">{t(`page.profile.shift.status.${selectedShift.status}`)}</Badge>
              </div>

              {schedule && (
                <div className="text-sm">
                  <div className="text-muted-foreground">{t('page.profile.info.schedule')}</div>
                  <div className="font-medium">{schedule.start} – {schedule.end}</div>
                </div>
              )}

              {(selectedShift.status === 'started' || selectedShift.status === 'completed') && (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="text-muted-foreground">{t('page.profile.day.started')}</div>
                      <div className="font-medium">{formatTime(selectedShift.startedAt)}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground">{t('page.profile.day.finished')}</div>
                      <div className="font-medium">{formatTime(selectedShift.finishedAt)}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="space-y-1">
                      <div className="text-muted-foreground">{t('page.profile.day.salary')}</div>
                      <div className="font-medium">
                        {formatMinor(selectedShift.salaryMinor)}
                        {currencySymbol ? ` ${currencySymbol}` : ''}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground">{t('page.profile.day.early')}</div>
                      <div className="font-medium text-green-600">
                        +{formatMinor(selectedShift.earlyBonusMinor)}
                        {currencySymbol ? ` ${currencySymbol}` : ''}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground">{t('page.profile.day.late')}</div>
                      <div className="font-medium text-red-600">
                        -{formatMinor(selectedShift.latePenaltyMinor)}
                        {currencySymbol ? ` ${currencySymbol}` : ''}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {dayEntries.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">{t('page.profile.day.entries')}</div>
              <div className="space-y-2">
                {dayEntries.map(entry => (
                  <div key={entry.id} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-sm">
                    <span>{t(`page.profile.entry.${entry.type}`)}</span>
                    <span className={entry.type === 'late_penalty' ? 'text-red-600' : entry.type === 'early_bonus' ? 'text-green-600' : 'font-medium'}>
                      {entry.type === 'late_penalty' ? '-' : '+'}
                      {formatMinor(Math.abs(entry.minorAmount))}
                      {currencySymbol ? ` ${currencySymbol}` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <PermissionGate permission={['workShift.edit', 'other.admin']}>
              {!selectedShift && selectedDay && (
                <Button
                  disabled={!canPlan || isMutating}
                  loading={isMutating}
                  onClick={() => void planDay(selectedDay)}
                >
                  {t('page.profile.actions.plan')}
                </Button>
              )}
              {selectedShift?.status === 'planned' && selectedDay && (
                <Button
                  variant="destructive"
                  disabled={!canPlan || isMutating}
                  loading={isMutating}
                  onClick={() => void unplanDay(selectedDay)}
                >
                  {t('page.profile.actions.unplan')}
                </Button>
              )}
            </PermissionGate>
            <Button type="button" variant="secondary" onClick={closeDaySheet}>
              {t('button.cancel')}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
