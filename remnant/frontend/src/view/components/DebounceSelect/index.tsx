import { Select, Spin } from 'antd';
import { useState, useRef, useMemo } from 'react';
import debounce from 'lodash.debounce';
import { useTranslation } from 'react-i18next';
// import debounce from '@/utils/helpers/debounce';

export default function Component({
  fetchOptions,
  debounceTimeout = 800,
  mapPattern = null,
  ...props
}) {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState([]);
  const { i18n } = useTranslation();
  const fetchRef = useRef(0);

  const debounceFetcher = useMemo(() => {
    const loadOptions = async (value) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);

      try {
        const newOptions = await fetchOptions(value);

        if (fetchId === fetchRef.current) {
          setOptions(newOptions.map(mapOptions));
        }
      } catch (error) {
        console.error('Error fetching options:', error);
      }

      setFetching(false);
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  function mapOptions(option) {
    const mapped =
      typeof mapPattern === 'function'
        ? mapPattern(option, i18n)
        : {
            label: option.names[i18n.language],
            value: option._id
          };

    return mapped;
  }

  return (
    <Select
      showSearch
      filterOption={false}
      onSearch={debounceFetcher}
      labelInValue
      allowClear
      notFoundContent={fetching ? <Spin size='small' /> : null}
      {...props}
      options={options}
    />
  );
}
