import type { ComponentProps } from 'react'
import { PHONE_DEFAULT_COUNTRY_FALLBACK, PHONE_DEFAULT_COUNTRY_SETTING_KEY } from '@remnant/shared'
import { CheckIcon, ChevronsUpDown } from 'lucide-react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import * as RPNInput from 'react-phone-number-input'
import flags from 'react-phone-number-input/flags'

import { useSettingValue } from '@/api/hooks'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ISO_COUNTRY_CODES } from '@/utils/constants'
import { cn } from '@/utils/lib/utils'

interface PhoneInputProps extends Omit<RPNInput.Props<typeof RPNInput.default>, 'onChange'> {
  onChange?: (value: RPNInput.Value) => void
  className?: string
  placeholder?: string
  disabled?: boolean
}

function InputComponent({ className, ...props }: ComponentProps<'input'>) {
  return (
    <Input
      className={cn('rounded-e-md rounded-s-none', className)}
      {...props}
    />
  )
}

interface CountryEntry {
  label: string
  value: RPNInput.Country | undefined
}

interface CountrySelectProps {
  disabled?: boolean
  value: RPNInput.Country
  options: CountryEntry[]
  onChange: (country: RPNInput.Country) => void
}

function FlagComponent({ country, countryName }: RPNInput.FlagProps) {
  const Flag = flags[country]

  return (
    <span className="bg-foreground/20 flex h-4 w-6 overflow-hidden rounded-sm [&_svg:not([class*='size-'])]:size-full">
      {Flag && <Flag title={countryName} />}
    </span>
  )
}

interface CountrySelectOptionProps extends RPNInput.FlagProps {
  selectedCountry: RPNInput.Country
  onChange: (country: RPNInput.Country) => void
  onSelectComplete: () => void
}

function CountrySelectOption({
  country,
  countryName,
  selectedCountry,
  onChange,
  onSelectComplete,
}: CountrySelectOptionProps) {
  return (
    <CommandItem
      className="gap-2"
      onSelect={() => {
        onChange(country)
        onSelectComplete()
      }}
    >
      <FlagComponent country={country} countryName={countryName} />
      <span className="flex-1 text-sm">{countryName}</span>
      <span className="text-foreground/50 text-sm">
        {`+${RPNInput.getCountryCallingCode(country)}`}
      </span>
      <CheckIcon
        className={cn(
          'ml-auto size-4',
          country === selectedCountry ? 'opacity-100' : 'opacity-0',
        )}
      />
    </CommandItem>
  )
}

function CountrySelect({
  disabled,
  value: selectedCountry,
  options: countryList,
  onChange,
}: CountrySelectProps) {
  const { t } = useTranslation()
  const [searchValue, setSearchValue] = React.useState('')
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Popover
      open={isOpen}
      modal
      onOpenChange={(open) => {
        setIsOpen(open)
        if (open)
          setSearchValue('')
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="flex gap-1 rounded-e-none rounded-s-md border-r-0 px-3 focus:z-10"
          disabled={disabled}
        >
          <FlagComponent
            country={selectedCountry}
            countryName={selectedCountry}
          />
          <ChevronsUpDown
            className={cn(
              '-mr-2 size-4 opacity-50',
              disabled ? 'hidden' : 'opacity-100',
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-75 p-0">
        <Command>
          <CommandInput
            value={searchValue}
            onValueChange={setSearchValue}
            placeholder={t('component.phoneInput.searchCountry')}
          />
          <CommandList className="h-72">
            <CommandEmpty>{t('component.phoneInput.noCountry')}</CommandEmpty>
            <CommandGroup>
              {countryList.map(({ value, label }) =>
                value
                  ? (
                      <CountrySelectOption
                        key={value}
                        country={value}
                        countryName={label}
                        selectedCountry={selectedCountry}
                        onChange={onChange}
                        onSelectComplete={() => setIsOpen(false)}
                      />
                    )
                  : null,
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function parseDefaultCountry(value: string | undefined): RPNInput.Country {
  const code = value?.trim().toUpperCase()
  if (code != null && (ISO_COUNTRY_CODES as readonly string[]).includes(code))
    return code as RPNInput.Country
  return PHONE_DEFAULT_COUNTRY_FALLBACK
}

function PhoneInput({ className, onChange, value, defaultCountry, ...props }: PhoneInputProps) {
  const countryFromSettings = useSettingValue(PHONE_DEFAULT_COUNTRY_SETTING_KEY)
  const resolvedCountry = defaultCountry ?? parseDefaultCountry(countryFromSettings)

  return (
    <RPNInput.default
      key={value ? 'phone-filled' : `phone-${resolvedCountry}`}
      className={cn('flex w-full', className)}
      flagComponent={FlagComponent}
      countrySelectComponent={CountrySelect}
      inputComponent={InputComponent}
      smartCaret={false}
      value={value || undefined}
      defaultCountry={resolvedCountry}
      onChange={next => onChange?.(next || ('' as RPNInput.Value))}
      {...props}
    />
  )
}

export { PhoneInput }
