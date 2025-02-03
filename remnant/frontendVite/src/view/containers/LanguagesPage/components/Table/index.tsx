import * as React from 'react';

import { useTranslation } from 'react-i18next';
import { TableColumnsType, Space, Button, Table } from 'antd';
import { useRequestLanguages } from '@/utils/api/hooks';
import { EditFilled, DeleteFilled } from '@ant-design/icons';
import { useLanguageContext } from '@/utils/contexts';

export default function CustomTable() {
  const { t } = useTranslation();
  const requestLanguages = useRequestLanguages({ pagination: { current: 1, pageSize: 10 } });

  const languageContext = useLanguageContext();

  const languages = requestLanguages?.data?.data?.languages ?? [];

  const columns: TableColumnsType<Language> = [
    {
      title: t('languagesPage.name'),
      dataIndex: 'name'
    },
    {
      title: t('languagesPage.code'),
      dataIndex: 'code'
    },
    {
      title: t('languagesPage.main'),
      dataIndex: 'main',
      render: (text) => text.toString()
    },
    {
      title: t('languagesPage.active'),
      dataIndex: 'active',
      render: (text) => text.toString()
    },
    {
      title: t('languagesPage.updated'),
      dataIndex: 'updatedAt'
    },
    {
      title: t('languagesPage.created'),
      dataIndex: 'createdAt'
    },
    {
      width: 40,
      key: 'key',
      dataIndex: '_id',
      render: (_id, record) => (
        <Space>
          <Button icon={<EditFilled />} onClick={() => languageContext.openModal(record)} />
          <Button icon={<DeleteFilled />} onClick={() => languageContext.removeLanguage({ _id })} />
        </Space>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={languages}
      // onChange={productsTableChange}
      // pagination={{ total: productsTableData.count }}
      rowKey={(record) => record._id}
    />
  );
}
