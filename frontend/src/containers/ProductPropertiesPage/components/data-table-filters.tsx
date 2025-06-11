import { Filter } from 'lucide-react'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui'

import { useDebounceCallback } from '@/utils/hooks'

export function DataTableFilters({ filters, setFilters }) {
  const { t } = useTranslation()
  const [localFilters, setLocalFilters] = useState(filters)

  const debouncedSetFilters = useDebounceCallback((value: object) => {
    setFilters(prev => ({ ...prev, ...value }))
  }, 300)

  const handleFilter = (field, value) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }))
    debouncedSetFilters({ [field]: value })
  }

  return (
    <div className="relative max-w-3xs min-w-64 max-md:max-w-full">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Filter className="h-4 w-4 text-gray-400" />
      </div>
      <Input
        placeholder={t('page.categories.filter.names')}
        value={localFilters.names}
        onChange={event => handleFilter('names', event.target.value)}
        className="pl-10"
      />
    </div>
  )
}
