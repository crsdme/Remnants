import type { WorkShiftDTO } from '@remnant/shared'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useLocale } from '@/utils/hooks'
import { cn } from '@/utils/lib/utils'
import { useProfileContext } from '../context'

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6]

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function shiftTone(status: WorkShiftDTO['status']) {
  switch (status) {
    case 'planned':
      return 'bg-violet-100 text-violet-800 border-violet-200'
    case 'completed':
      return 'bg-sky-100 text-sky-800 border-sky-200'
    case 'started':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'absent':
      return 'bg-rose-100 text-rose-800 border-rose-200'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

export function ProfileMonthCalendar() {
  const { t } = useLocale()
  const {
    year,
    month,
    setYear,
    setMonth,
    summary,
    selectedDay,
    openDaySheet,
    isFetchingMonth,
    canPlan,
  } = useProfileContext()

  const shiftsByDate = useMemo(() => {
    const map = new Map<string, WorkShiftDTO>()
    for (const shift of summary?.shifts ?? [])
      map.set(shift.workDate, shift)
    return map
  }, [summary?.shifts])

  const today = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  }, [])

  const cells = useMemo(() => {
    const first = new Date(year, month - 1, 1)
    const daysInMonth = new Date(year, month, 0).getDate()
    const sundayIndex = first.getDay()
    const result: Array<{ date: string | null, day: number | null, outside: boolean }> = []

    const prevMonthDays = new Date(year, month - 1, 0).getDate()
    for (let i = sundayIndex - 1; i >= 0; i--) {
      const day = prevMonthDays - i
      const prevMonth = month === 1 ? 12 : month - 1
      const prevYear = month === 1 ? year - 1 : year
      result.push({
        day,
        date: `${prevYear}-${pad(prevMonth)}-${pad(day)}`,
        outside: true,
      })
    }

    for (let day = 1; day <= daysInMonth; day++) {
      result.push({
        day,
        date: `${year}-${pad(month)}-${pad(day)}`,
        outside: false,
      })
    }

    let nextDay = 1
    while (result.length % 7 !== 0) {
      const nextMonth = month === 12 ? 1 : month + 1
      const nextYear = month === 12 ? year + 1 : year
      result.push({
        day: nextDay,
        date: `${nextYear}-${pad(nextMonth)}-${pad(nextDay)}`,
        outside: true,
      })
      nextDay += 1
    }

    return result
  }, [year, month])

  function goPrev() {
    if (month === 1) {
      setMonth(12)
      setYear(year - 1)
      return
    }
    setMonth(month - 1)
  }

  function goNext() {
    if (month === 12) {
      setMonth(1)
      setYear(year + 1)
      return
    }
    setMonth(month + 1)
  }

  function goToday() {
    const d = new Date()
    setYear(d.getFullYear())
    setMonth(d.getMonth() + 1)
    openDaySheet(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`)
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 border-b">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToday}>
            {t('page.profile.calendar.today')}
          </Button>
          <Button variant="outline" size="icon" onClick={goPrev} aria-label="Previous month">
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goNext} aria-label="Next month">
            <ChevronRight className="size-4" />
          </Button>
          <CardTitle className="text-base font-semibold">
            {t(`page.profile.calendar.month.${month}`)}
            {' '}
            {year}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className={cn('p-0 transition-opacity', isFetchingMonth && 'opacity-60')}>
        <div className="grid grid-cols-7 border-b">
          {WEEKDAYS.map(d => (
            <div
              key={d}
              className="px-2 py-2.5 text-center text-xs font-medium text-muted-foreground"
            >
              {t(`page.profile.calendar.weekday.${d}`)}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-[minmax(112px,1fr)]">
          {cells.map((cell, idx) => {
            if (!cell.date)
              return <div key={`empty-${idx}`} />

            const shift = !cell.outside ? shiftsByDate.get(cell.date) : undefined
            const isSelected = selectedDay === cell.date
            const isToday = cell.date === today

            return (
              <button
                key={cell.date}
                type="button"
                disabled={cell.outside}
                onClick={() => {
                  if (!cell.outside)
                    openDaySheet(cell.date!)
                }}
                className={cn(
                  'group relative flex min-h-[112px] flex-col items-stretch gap-1 border-b border-r p-2 text-left transition-colors',
                  cell.outside
                    ? 'bg-muted/20 text-muted-foreground cursor-default'
                    : 'hover:bg-muted/30 cursor-pointer',
                  isSelected && !cell.outside && 'bg-primary/5 ring-1 ring-inset ring-primary/40',
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'inline-flex size-7 items-center justify-center rounded-full text-sm',
                      isToday && 'bg-primary text-primary-foreground font-semibold',
                      cell.outside && 'opacity-40',
                    )}
                  >
                    {cell.day}
                  </span>
                  {!cell.outside && !shift && canPlan && (
                    <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      +
                      {' '}
                      {t('page.profile.calendar.plan')}
                    </span>
                  )}
                </div>

                {shift && (
                  <div
                    className={cn(
                      'mt-auto rounded-md border px-1.5 py-1 text-[11px] font-medium leading-tight',
                      shiftTone(shift.status),
                    )}
                  >
                    {t(`page.profile.shift.status.${shift.status}`)}
                    {shift.plannedSchedule && shift.status === 'planned' && (
                      <div className="font-normal opacity-80">
                        {shift.plannedSchedule.start}
                        {' – '}
                        {shift.plannedSchedule.end}
                      </div>
                    )}
                    {shift.startedAt && shift.status !== 'planned' && (
                      <div className="font-normal opacity-80">
                        {new Date(shift.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {shift.finishedAt
                          ? ` – ${new Date(shift.finishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                          : ''}
                      </div>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
