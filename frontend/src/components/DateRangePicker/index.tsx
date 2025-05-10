import type { HTMLAttributes } from 'react'
import type { DateRange } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/utils/lib/utils'
import { endOfDay, format, startOfDay } from 'date-fns'

import { enUS, ru } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

type DateRangePickerProps = Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> & {
  onSelect?: (date: DateRange | undefined) => void
  value?: DateRange | undefined
}

export function DateRangePicker({ className, onSelect, value }: DateRangePickerProps) {
  const { t, i18n } = useTranslation()
  const [date, setDate] = useState<DateRange | undefined>(
    value || {
      from: undefined,
      to: undefined,
    },
  )

  const handleSelect = (selectedDate: DateRange | undefined) => {
    setDate(selectedDate)
    if (selectedDate?.from && selectedDate?.to) {
      onSelect?.({
        from: startOfDay(selectedDate?.from),
        to: endOfDay(selectedDate?.to),
      })
    }
  }

  const getLocale = () => {
    switch (i18n.language) {
      case 'ru':
        return ru
      default:
        return enUS
    }
  }

  const formatDate = (date: Date) => {
    return format(date, 'LLL dd, y', { locale: getLocale() })
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              'w-[240px] justify-start text-left font-normal',
              !date && 'text-muted-foreground',
              'w-full',
            )}
          >
            <CalendarIcon />
            {date?.from
              ? (
                  date.to
                    ? (
                        <>
                          {formatDate(date.from)}
                          -
                          {formatDate(date.to)}
                        </>
                      )
                    : (
                        formatDate(date.from)
                      )
                )
              : (
                  <span>{t('component.datePicker.pickDate')}</span>
                )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={getLocale()}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
