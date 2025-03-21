import * as React from 'react';

import { useTranslation } from 'react-i18next';
import { Button, Space, Table, TableColumnsType, Tag } from 'antd';
import { DeleteFilled, EditFilled } from '@ant-design/icons';

import formatDate from '@/utils/helpers/formatDate';
import { useProductContext } from '@/utils/contexts';
import { useRequestProducts } from '@/api/hooks';

export default function CustomTable() {
  const { t } = useTranslation();
  const [paginationParams, setPaginationParams] = React.useState({
    current: 1,
    pageSize: 10
  });

  const requestProducts = useRequestProducts({ pagination: paginationParams });

  const productContext = useProductContext();

  const columns: TableColumnsType<Product> = [
    {
      title: t('productsPage.name'),
      dataIndex: 'name',
      fixed: 'left'
    },
    {
      title: t('productsPage.code'),
      dataIndex: 'code',
      render: (text) => <Tag>{text}</Tag>
    },
    {
      title: t('productsPage.main'),
      dataIndex: 'main',
      render: (text) => <Tag color={text ? 'green' : 'red'}>{text.toString()}</Tag>
    },
    {
      title: t('productsPage.active'),
      dataIndex: 'active',
      render: (text) => <Tag color={text ? 'green' : 'red'}>{text.toString()}</Tag>
    },
    {
      title: t('productsPage.updated'),
      dataIndex: 'updatedAt',
      render: (value) => formatDate(value)
    },
    {
      title: t('productsPage.created'),
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
          <Button icon={<EditFilled />} onClick={() => productContext.openModal(record)} />
          <Button icon={<DeleteFilled />} onClick={() => productContext.removeProduct({ _id })} />
        </Space>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={requestProducts.data.data.products ?? []}
      onChange={(tableData) =>
        setPaginationParams({
          current: tableData.current ?? 1,
          pageSize: tableData.pageSize ?? 10
        })
      }
      pagination={{
        total: requestProducts.data.data.productsCount ?? 0
      }}
      rowKey={(record) => record._id}
      scroll={{ x: 'max-content' }}
      // sticky={{ offsetHeader: 0 }}
    />
  );
}
