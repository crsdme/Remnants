import * as React from 'react';

import { useTranslation } from 'react-i18next';
import { Button, Space, Table, TableColumnsType, Tag } from 'antd';
import { DeleteFilled, EditFilled } from '@ant-design/icons';

import formatDate from '@/utils/helpers/formatDate';
import { useUnitContext } from '@/utils/contexts';
import { useRequestUnits } from '@/api/hooks';

export default function CustomTable() {
  const { t, i18n } = useTranslation();
  const [paginationParams, setPaginationParams] = React.useState({
    current: 1,
    pageSize: 10
  });

  const requestUnits = useRequestUnits({ pagination: paginationParams });

  const unitContext = useUnitContext();

  const columns: TableColumnsType<Unit> = [
    {
      title: t('unitPage.names'),
      dataIndex: 'names',
      fixed: 'left',
      render: (names) => names[i18n.language]
    },
    {
      title: t('unitPage.symbols'),
      dataIndex: 'symbols',
      render: (symbols) => <Tag>{symbols[i18n.language]}</Tag>
    },
    {
      title: t('unitPage.priority'),
      dataIndex: 'priority',
      render: (text) => <Tag>{text}</Tag>
    },
    {
      title: t('unitPage.active'),
      dataIndex: 'active',
      render: (text) => <Tag color={text ? 'green' : 'red'}>{text.toString()}</Tag>
    },
    {
      title: t('unitPage.updated'),
      dataIndex: 'updatedAt',
      render: (value) => formatDate(value)
    },
    {
      title: t('unitPage.created'),
      dataIndex: 'createdAt',
      render: (value) => formatDate(value)
    },
    {
      width: 40,
      key: 'key',
      dataIndex: '_id',
      fixed: 'right',
      render: (_id, record) => (
        <Space>
          <Button icon={<EditFilled />} onClick={() => unitContext.openModal(record)} />
          <Button icon={<DeleteFilled />} onClick={() => unitContext.removeUnit({ _id })} />
        </Space>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={requestUnits.data.data.units ?? []}
      onChange={(tableData) =>
        setPaginationParams({
          current: tableData.current ?? 1,
          pageSize: tableData.pageSize ?? 10
        })
      }
      pagination={{
        total: requestUnits.data.data.unitsCount ?? 0
      }}
      rowKey={(record) => record._id}
      scroll={{ x: 'max-content' }}
    />
  );
}
