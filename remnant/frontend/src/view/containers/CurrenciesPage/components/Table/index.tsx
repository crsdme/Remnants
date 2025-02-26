import * as React from 'react';

import { useTranslation } from 'react-i18next';
import { TableColumnsType, Space, Button, Table, Tag } from 'antd';
import { useRequestCurrencies } from '@/utils/api/hooks';
import { EditFilled, DeleteFilled } from '@ant-design/icons';
import { useCurrencyContext } from '@/utils/contexts';
import formatDate from '@/utils/helpers/formatDate';

export default function CustomTable() {
  const { t, i18n } = useTranslation();
  const [paginationParams, setPaginationParams] = React.useState({
    current: 1,
    pageSize: 10
  });

  const requestCurrencies = useRequestCurrencies({ pagination: paginationParams });

  const currencyContext = useCurrencyContext();

  const columns: TableColumnsType<Currency> = [
    {
      title: t('currencyPage.names'),
      dataIndex: 'names',
      fixed: 'left',
      render: (names) => names[i18n.language]
    },
    {
      title: t('currencyPage.symbols'),
      dataIndex: 'symbols',
      render: (symbols) => <Tag>{symbols[i18n.language]}</Tag>
    },
    {
      title: t('currencyPage.priority'),
      dataIndex: 'priority',
      render: (text) => <Tag>{text}</Tag>
    },
    {
      title: t('currencyPage.active'),
      dataIndex: 'active',
      render: (text) => <Tag color={text ? 'green' : 'red'}>{text.toString()}</Tag>
    },
    {
      title: t('currencyPage.updated'),
      dataIndex: 'updatedAt',
      render: (value) => formatDate(value)
    },
    {
      title: t('currencyPage.created'),
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
          <Button icon={<EditFilled />} onClick={() => currencyContext.openModal(record)} />
          <Button icon={<DeleteFilled />} onClick={() => currencyContext.removeCurrency({ _id })} />
        </Space>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={requestCurrencies.data.data.currencies ?? []}
      onChange={(tableData) =>
        setPaginationParams({
          current: tableData.current ?? 1,
          pageSize: tableData.pageSize ?? 10
        })
      }
      pagination={{
        total: requestCurrencies.data.data.currenciesCount ?? 0
      }}
      rowKey={(record) => record._id}
      scroll={{ x: 'max-content' }}
    />
  );
}
