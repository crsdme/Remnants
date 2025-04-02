import { useCallback, useState, useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { Filter, X } from 'lucide-react';
import debounce from 'lodash.debounce';

import { Input, Button } from '@/view/components/ui';
import { MultiSelect } from '@/view/components/MultiSelect';
import { DatePickerRange } from '@/view/components/DatePickerRange';

export function DataTableFilters({ filters, setFilters }) {
  const { t } = useTranslation();
  const [localFilters, setLocalFilters] = useState(filters);

  const areAllFiltersCleared = useMemo(() => {
    return (
      !localFilters.names &&
      !localFilters.symbols &&
      localFilters.active.length === 0 &&
      !localFilters.createdAt.from &&
      !localFilters.createdAt.to
    );
  }, [localFilters]);

  const debouncedSetFilters = useCallback(
    debounce((value) => {
      setFilters((prev) => ({ ...prev, ...value }));
    }, 300),
    [filters.language]
  );

  const handleFilter = (field, value) => {
    setLocalFilters((prev) => ({ ...prev, [field]: value }));
    debouncedSetFilters({ [field]: value });
  };

  const handleClearAll = () => {
    const clearedFilters = {
      names: '',
      symbols: '',
      active: [],
      createdAt: { from: undefined, to: undefined },
      language: filters.language
    };
    setLocalFilters(clearedFilters);
    setFilters(clearedFilters);
  };

  return (
    <div className='w-full'>
      <div className='flex justify-between items-center max-md:flex-col py-2 gap-2'>
        <div className='flex gap-2'>
          <div className='relative max-w-3xs max-md:max-w-full'>
            <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
              <Filter className='h-4 w-4 text-gray-400' />
            </div>
            <Input
              placeholder={t('page.currencies.filter.names')}
              value={localFilters.names}
              onChange={(event) => handleFilter('names', event.target.value)}
              className='pl-10'
            />
          </div>

          <div className='relative max-w-3xs max-md:max-w-full'>
            <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
              <Filter className='h-4 w-4 text-gray-400' />
            </div>
            <Input
              placeholder={t('page.currencies.filter.symbols')}
              value={localFilters.symbols}
              onChange={(event) => handleFilter('symbols', event.target.value)}
              className='pl-10'
            />
          </div>

          <MultiSelect
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
          />

          {!areAllFiltersCleared && (
            <Button variant='outline' onClick={handleClearAll} className='flex items-center gap-2'>
              <X className='h-4 w-4' />
              {t('page.currencies.filters.clearAll')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
