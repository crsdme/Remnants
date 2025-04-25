import { Spin, TreeSelect } from 'antd'

import debounce from 'lodash.debounce'
import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function DebounceTreeSelect({
  fetchOptions,
  debounceTimeout = 800,
  mapPattern,
  ...props
}) {
  const [fetching, setFetching] = useState(false)
  const [treeData, setTreeData] = useState([])
  const { i18n } = useTranslation()
  const fetchRef = useRef(0)

  const debounceFetcher = useMemo(() => {
    const loadOptions = async (value: string) => {
      fetchRef.current += 1
      const fetchId = fetchRef.current
      setTreeData([])
      setFetching(true)

      try {
        const newOptions = await fetchOptions(value)
        if (fetchId === fetchRef.current) {
          setTreeData(newOptions.map(mapOptions))
        }
      }
      catch (error) {
        console.error('Error fetching tree options:', error)
      }

      setFetching(false)
    }

    return debounce(loadOptions, debounceTimeout)
  }, [fetchOptions, debounceTimeout])

  function mapOptions(option) {
    const children = Array.isArray(option.children) ? option.children : []

    const mapped
      = typeof mapPattern === 'function'
        ? mapPattern(option, i18n)
        : {
            title: option.names[i18n.language],
            value: option._id,
          }

    return {
      ...mapped,
      children: children.map(mapOptions),
    }
  }

  return (
    <TreeSelect
      showSearch
      filterTreeNode={false}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      {...props}
      treeData={treeData}
      allowClear
      treeDefaultExpandAll={false}
      dropdownStyle={{
        maxHeight: 400,
        overflow: 'auto',
      }}
    />
  )
}
