import { Filter } from 'lucide-react'
import { useState } from 'react'

import { Input } from '@/components/ui'
import { useDebounceCallback, useLocale } from '@/utils/hooks'

export function DataTableFilters({ filters, setFilters }: { filters: any, setFilters: (filters: any) => void }) {
  const { t } = useLocale()
  const [localFilters, setLocalFilters] = useState(filters)

  const debouncedSetFilters = useDebounceCallback(setFilters, 300)

  const handleFilter = (field: string, value: string) => {
    setLocalFilters((prev: any) => ({ ...prev, [field]: value }))
    debouncedSetFilters({ [field]: value })
  }

  return (
    <div className="relative max-w-3xs min-w-64 max-md:max-w-full">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Filter className="h-4 w-4 text-gray-400" />
      </div>
      <Input
        placeholder={t('page.units.filter.names')}
        value={localFilters.names}
        onChange={event => handleFilter('names', event.target.value)}
        className="pl-10"
      />
    </div>
  )
}
