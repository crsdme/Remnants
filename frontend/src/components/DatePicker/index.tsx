import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'

import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import { DATE_LOCALE_MAP } from '@/utils/constants'

export function DatePicker({
  value,
  onChange,
  disabled,
}: {
  value?: Date
  onChange: (date: Date | undefined) => void
  disabled?: boolean
}) {
  const { t, i18n } = useTranslation()
  const currentLocale = DATE_LOCALE_MAP[i18n.language]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!value}
          className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, 'PPP') : <span>{t('component.datePicker.pickDate')}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          disabled={disabled}
          locale={currentLocale}
        />
      </PopoverContent>
    </Popover>
  )
}
