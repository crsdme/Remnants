import * as React from 'react';

import { useTranslation } from 'react-i18next';
import { TableColumnsType, Space, Button, Table, Tag } from 'antd';
import { useRequestLanguages } from '@/utils/api/hooks';
import { EditFilled, DeleteFilled } from '@ant-design/icons';
import { useLanguageContext } from '@/utils/contexts';
import formatDate from '@/utils/helpers/formatDate';

export default function CustomTable() {
  const { t } = useTranslation();
  const [paginationParams, setPaginationParams] = React.useState({
    current: 1,
    pageSize: 10
  });

  const requestLanguages = useRequestLanguages({ pagination: paginationParams });

  const languageContext = useLanguageContext();

  const columns: TableColumnsType<Language> = [
    {
      title: t('languagesPage.name'),
      dataIndex: 'name',
      fixed: 'left'
    },
    {
      title: t('languagesPage.code'),
      dataIndex: 'code',
      render: (text) => <Tag>{text}</Tag>
    },
    {
      title: t('languagesPage.main'),
      dataIndex: 'main',
      render: (text) => <Tag color={text ? 'green' : 'red'}>{text.toString()}</Tag>
    },
    {
      title: t('languagesPage.active'),
      dataIndex: 'active',
      render: (text) => <Tag color={text ? 'green' : 'red'}>{text.toString()}</Tag>
    },
    {
      title: t('languagesPage.updated'),
      dataIndex: 'updatedAt',
      render: (value) => formatDate(value)
    },
    {
      title: t('languagesPage.created'),
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
          <Button icon={<EditFilled />} onClick={() => languageContext.openModal(record)} />
          <Button icon={<DeleteFilled />} onClick={() => languageContext.removeLanguage({ _id })} />
        </Space>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={requestLanguages?.data?.data?.languages ?? []}
      onChange={(tableData) =>
        setPaginationParams({
          current: tableData.current ?? 1,
          pageSize: tableData.pageSize ?? 10
        })
      }
      pagination={{
        total: requestLanguages?.data?.data?.languagesCount ?? 0
      }}
      rowKey={(record) => record._id}
      scroll={{ x: 'max-content' }}
      // sticky={{ offsetHeader: 0 }}
    />
  );
}
