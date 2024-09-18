import React, { useState } from 'react';
import { TreeSelect } from 'antd';
import { debounce } from 'lodash';

const DebouncedTreeSelect = () => {
  const [searchValue, setSearchValue] = useState('');

  const fetchData = debounce((value) => {
    
  }, 300);

  const handleSearch = (value) => {
    setSearchValue(value);
    fetchData(value);
  };

  // Your tree data
  const treeData = [
    {
      title: 'Node 1',
      value: 'node1',
      children: [
        {
          title: 'Node 1.1',
          value: 'node1.1',
        },
        {
          title: 'Node 1.2',
          value: 'node1.2',
        },
      ],
    },
    // Add more nodes as needed
  ];

  return (
    <TreeSelect
      showSearch
      value={searchValue}
      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
      placeholder="Select a node"
      allowClear
      treeDefaultExpandAll
      onChange={handleSearch}
      treeData={treeData}
    />
  );
};

export default DebouncedTreeSelect;