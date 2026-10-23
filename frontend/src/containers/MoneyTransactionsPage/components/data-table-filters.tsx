import { Filter } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Input } from '@/components/ui'
import { useDebounceCallback } from '@/utils/hooks'

function amountToInput(amount: string | number | undefined): string {
  return amount == null || amount === '' ? '' : String(amount)
}

export function DataTableFilters({
  filters,
  setFilters,
}: {
  filters: { amount?: string | number }
  setFilters: (filters: { amount?: string | number }) => void
}) {
  const { t } = useTranslation()
  const [localAmount, setLocalAmount] = useState(() => amountToInput(filters.amount))

  const debouncedSetFilters = useDebounceCallback(setFilters, 300)

  useEffect(() => {
    setLocalAmount(amountToInput(filters.amount))
  }, [filters.amount])

  const handleAmountChange = (value: string) => {
    setLocalAmount(value)
    const trimmed = value.trim()
    debouncedSetFilters({ amount: trimmed === '' ? undefined : trimmed })
  }

  return (
    <div className="relative max-w-3xs min-w-64 max-md:max-w-full">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Filter className="h-4 w-4 text-gray-400" />
      </div>
      <Input
        type="number"
        inputMode="decimal"
        placeholder={t('page.money-transactions.filter.amount')}
        value={localAmount}
        onChange={event => handleAmountChange(event.target.value)}
        className="pl-10"
      />
    </div>
  )
}
