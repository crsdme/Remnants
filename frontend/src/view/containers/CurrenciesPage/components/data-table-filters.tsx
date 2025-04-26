import { useDebounceCallback } from '@/utils/hooks'

import { Input } from '@/view/components/ui'
import { Filter } from 'lucide-react'
import { useState } from 'react'

import { useTranslation } from 'react-i18next'
// import { MultiSelect } from '@/view/components/MultiSelect';
// import { DatePickerRange } from '@/view/components/DatePickerRange';

export function DataTableFilters({ filters, setFilters }) {
  const { t } = useTranslation()
  const [localFilters, setLocalFilters] = useState(filters)

  // const areAllFiltersCleared = useMemo(() => {
  //   return (
  //     !localFilters.names &&
  //     !localFilters.symbols &&
  //     localFilters.active.length === 0 &&
  //     !localFilters.createdAt.from &&
  //     !localFilters.createdAt.to
  //   );
  // }, [localFilters]);

  const debouncedSetFilters = useDebounceCallback((value: object) => {
    setFilters(prev => ({ ...prev, ...value }))
  }, 300)

  const handleFilter = (field, value) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }))
    debouncedSetFilters({ [field]: value })
  }

  // const handleClearAll = () => {
  //   const clearedFilters = {
  //     names: '',
  //     symbols: '',
  //     active: [],
  //     createdAt: { from: undefined, to: undefined },
  //     language: filters.language
  //   };
  //   setLocalFilters(clearedFilters);
  //   setFilters(clearedFilters);
  // };

  return (
    <>
      <div className="relative max-w-3xs min-w-64 max-md:max-w-full">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Filter className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          placeholder={t('page.currencies.filter.names')}
          value={localFilters.names}
          onChange={event => handleFilter('names', event.target.value)}
          className="pl-10"
        />
      </div>

      {/* <MultiSelect
        options={[
          { value: 'true', label: t('page.currencies.select.value.active') },
          { value: 'false', label: t('page.currencies.select.value.notactive') }
        ]}
        onChange={(selectedValues) => handleFilter('active', selectedValues)}
        value={localFilters.active}
        activeFiltersLabel={t('page.currencies.select.label.active')}
      />

      <DatePickerRange
        value={localFilters.createdAt}
        onSelect={(selectedValues) => handleFilter('createdAt', selectedValues)}
      /> */}

      {/* {!areAllFiltersCleared && (
        <Button variant='outline' onClick={handleClearAll} className='flex items-center gap-2'>
          <X className='h-4 w-4' />
          {t('page.currencies.filters.clearAll')}
        </Button>
      )} */}
    </>
  )
}
