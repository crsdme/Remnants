import { Search } from 'lucide-react'

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
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <Input
        placeholder={t('component.productSelectTable.filter.placeholder')}
        value={localFilters.search}
        onChange={event => handleFilter('search', event.target.value)}
        className="pl-10"
      />
    </div>
  )
}
