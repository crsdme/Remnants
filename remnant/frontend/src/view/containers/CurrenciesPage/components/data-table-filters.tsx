import { useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import { Filter } from 'lucide-react';
import debounce from 'lodash.debounce';

import { Input } from '@/view/components/ui';
import { MultiSelect } from '@/view/components/MultiSelect';
import { DatePickerRange } from '@/view/components/DatePickerRange';

export function DataTableFilters({ setFilters }: { setFilters: (state: unknown) => void }) {
  const { t } = useTranslation();

  const handleSearch = useCallback(
    debounce((value) => {
      setFilters((state) => ({ ...state, ...value }));
    }, 300),
    []
  );

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
              onChange={(event) => handleSearch({ names: event.target.value })}
              className='pl-10'
            />
          </div>
          <div className='relative max-w-3xs max-md:max-w-full'>
            <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
              <Filter className='h-4 w-4 text-gray-400' />
            </div>
            <Input
              placeholder={t('page.currencies.filter.symbols')}
              onChange={(event) => handleSearch({ symbols: event.target.value })}
              className='pl-10'
            />
          </div>
          <MultiSelect
            options={[
              { value: 'true', label: t('page.currencies.select.value.active') },
              { value: 'false', label: t('page.currencies.select.value.notactive') }
            ]}
            onChange={(selectedValues) => handleSearch({ active: selectedValues })}
            activeFiltersLabel={t('page.currencies.select.label.active')}
          />
          <DatePickerRange
            onSelect={(selectedValues) => handleSearch({ createdAt: selectedValues })}
          />
        </div>
      </div>
    </div>
  );
}
