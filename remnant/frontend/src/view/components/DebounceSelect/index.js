import { Select, Spin } from 'antd';
import { useState, useRef, useMemo } from 'react';
import debounce from 'lodash/debounce';

export default function Component({ fetchOptions, debounceTimeout = 800, ...props }) {
    const [fetching, setFetching] = useState(false);
    const [options, setOptions] = useState([]);
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
            setOptions(newOptions);
          }
        } catch (error) {
          console.error('Error fetching options:', error);
        }
  
        setFetching(false);
      };
  
      return debounce(loadOptions, debounceTimeout);
    }, [fetchOptions, debounceTimeout]);
  
    return (
      <Select
        showSearch
        labelInValue
        dropdownMatchSelectWidth={false}
        filterOption={false}
        onSearch={debounceFetcher}
        notFoundContent={fetching ? <Spin size="small" /> : null}
        {...props}
        options={options}
      />
    );
  }