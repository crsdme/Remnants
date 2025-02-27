import * as React from 'react';

import { useTranslation } from 'react-i18next';
import { TableColumnsType, Space, Button, Table, Tag } from 'antd';
import { useRequestCategories } from '@/api/hooks';
import { EditFilled, DeleteFilled } from '@ant-design/icons';
import { useCategoryContext } from '@/utils/contexts';
import formatDate from '@/utils/helpers/formatDate';

export default function CustomTable() {
  const { t, i18n } = useTranslation();
  const [paginationParams, setPaginationParams] = React.useState({
    current: 1,
    pageSize: 10
  });

  const requestCategories = useRequestCategories({ pagination: paginationParams });

  const categoryContext = useCategoryContext();

  const columns: TableColumnsType<Category> = [
    {
      title: t('categoryPage.names'),
      dataIndex: 'names',
      fixed: 'left',
      render: (names) => names[i18n.language]
    },
    {
      title: t('categoryPage.priority'),
      dataIndex: 'priority',
      render: (text) => <Tag>{text}</Tag>
    },
    {
      title: t('categoryPage.updated'),
      dataIndex: 'updatedAt',
      render: (value) => formatDate(value)
    },
    {
      title: t('categoryPage.created'),
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
          <Button icon={<EditFilled />} onClick={() => categoryContext.openModal(record)} />
          <Button icon={<DeleteFilled />} onClick={() => categoryContext.removeCategory({ _id })} />
        </Space>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={requestCategories.data.data.categories ?? []}
      onChange={(tableData) =>
        setPaginationParams({
          current: tableData.current ?? 1,
          pageSize: tableData.pageSize ?? 10
        })
      }
      pagination={{
        total: requestCategories.data.data.categoriesCount ?? 0
      }}
      rowKey={(record) => record._id}
      scroll={{ x: 'max-content' }}
    />
  );
}
