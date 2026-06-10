import { Check, ChevronsUpDown } from 'lucide-react'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { ISO_COUNTRY_CODES } from '@/utils/constants'
import { cn } from '@/utils/lib/utils'

export type CountryCode = (typeof ISO_COUNTRY_CODES)[number]

interface CountryOption {
  code: CountryCode
  label: string
  flag: string
  keywords: string
}

interface Props {
  value?: CountryCode | null
  onChange?: (v: CountryCode | null) => void
  locale: string | string[]
  placeholder?: string
  disabled?: boolean
  allowClear?: boolean
  preferred?: CountryCode[]
  initialCount?: number
}

export function CountrySelect({
  value = null,
  onChange,
  locale,
  placeholder,
  disabled,
  allowClear = false,
  preferred,
  initialCount = 10,
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { t } = useTranslation()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [popoverWidth, setPopoverWidth] = useState<number>()
  useEffect(() => {
    const el = triggerRef.current
    if (!el)
      return
    const ro = new ResizeObserver(() => setPopoverWidth(el.offsetWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const nameOf = useMemo(() => makeCountryNamer(locale), [locale])

  const options = useMemo<CountryOption[]>(() => {
    return ISO_COUNTRY_CODES
      .map((code) => {
        const label = nameOf(code)
        const flag = countryFlagFromAlpha2(code)
        const keywords = norm(`${label} ${code}`)
        return { code, label, flag, keywords }
      })
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [nameOf])

  const selected = value ? options.find(o => o.code === value) ?? null : null

  const itemsToRender = useMemo(() => {
    if (query.trim() !== '')
      return options

    if (preferred && preferred.length > 0) {
      const set = new Set(preferred)
      const top = options.filter(o => set.has(o.code)).slice(0, initialCount)
      if (top.length > 0)
        return top
    }
    return options.slice(0, initialCount)
  }, [options, preferred, initialCount, query])

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v)
          setQuery('')
      }}
    >
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selected
            ? (
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden>{selected.flag}</span>
                  <span>{selected.label}</span>
                  <span className="text-muted-foreground">
                    (
                    {selected.code}
                    )
                  </span>
                </span>
              )
            : (
                <span className="text-muted-foreground">{placeholder || t('component.countrySelect.placeholder')}</span>
              )}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent style={{ width: popoverWidth }} className="p-0">
        <Command
          filter={(_value, search, keywords) => {
            if (!keywords)
              return 0
            return String(keywords).includes(norm(search)) ? 1 : 0
          }}
        >
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder={t('component.countrySelect.searchPlaceholder')}
          />
          <CommandEmpty>{t('component.countrySelect.noResultsMessage')}</CommandEmpty>

          <CommandGroup>
            {allowClear && (
              <CommandItem
                key="__clear"
                value="__clear"
                keywords={['clear']}
                onSelect={() => {
                  onChange?.(null)
                  setOpen(false)
                }}
              >
                <span className="text-muted-foreground">{t('component.countrySelect.clearSelection')}</span>
              </CommandItem>
            )}

            {itemsToRender.map(o => (
              <CommandItem
                key={o.code}
                value={o.code}
                data-keywords={o.keywords}
                keywords={[o.keywords] as any}
                onSelect={() => {
                  onChange?.(o.code)
                  setOpen(false)
                }}
              >
                <span className="mr-2" aria-hidden>{o.flag}</span>
                <span className="flex-1">{o.label}</span>
                <span className="text-muted-foreground mr-2">
                  (
                  {o.code}
                  )
                </span>
                <Check className={cn('h-4 w-4', value === o.code ? 'opacity-100' : 'opacity-0')} />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function countryFlagFromAlpha2(code: CountryCode) {
  return code
    .toUpperCase()
    .replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)))
}

function makeCountryNamer(locale: string | string[] = 'en') {
  const dn = new (Intl as any).DisplayNames(locale, { type: 'region' })
  return (code: CountryCode) => dn.of(code) ?? code
}

function norm(s: string) {
  return s
    .normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '')
    .toLowerCase()
}
