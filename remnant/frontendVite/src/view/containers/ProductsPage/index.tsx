import * as React from 'react';

import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Table, Image, TableColumnsType } from 'antd';
import { useRequestProducts } from '@/utils/api/hooks';
import { backendUrl } from '@/utils/constants';
import Navigation from './components/Navigation';

export function ProductsPage() {
  const { t } = useTranslation();
  const selectedLanguage = 'en';

  const requestProducts = useRequestProducts({ filters: [] });

  if (requestProducts.isLoading) return `loading`;

  const products = requestProducts.data.data.products ?? [];

  const columns: TableColumnsType<Product> = [
    {
      title: t('productsPage.image'),
      width: 80,
      render: (text, { images }) => (
        <div className='productImages'>
          <Image.PreviewGroup
            items={images?.map((image) => `${backendUrl}/${image.main.path}`) ?? []}
          >
            <Image
              className='productImage'
              width={70}
              src={images?.[0]?.preview?.path ? `${backendUrl}/${images[0].preview.path}` : null}
            />
          </Image.PreviewGroup>
        </div>
      )
    },
    {
      title: t('productsPage.names'),
      dataIndex: 'names',
      render: (text) => text[selectedLanguage]
    },
    {
      title: t('productsPage.price'),
      dataIndex: 'price',
      render: (text, { currency }) => `${text} ${currency?.symbol}`
    },
    {
      title: t('productsPage.wholesalePrice'),
      dataIndex: 'wholesalePrice',
      render: (text, { wholesaleCurrency }) => `${text} ${wholesaleCurrency?.symbol}`
    },
    {
      title: t('productsPage.quantity'),
      dataIndex: 'quantity',
      // filters: (props.stocks || []).map((item) => ({
      //   text: item.names[selectedLanguage],
      //   value: item._id
      // })),
      // filteredValue: selectedStock || null,
      // filtred: selectedStock !== null,
      // defaultFilteredValue: props?.stocks?.[0]?._id || null,
      // filterMultiple: false,
      render: (quantity, { unit }) => `${quantity?.amount || 0} ${unit?.symbol || ''}`
    },
    // {
    //   title: t('productsPage.categories'),
    //   dataIndex: 'categories',
    //   key: 'categories'
    // render: (categories) => (
    //   <>
    //     {(categories || []).map((tag, key) => (
    //       <Tag key={key}>{tag.names[selectedLanguage]}</Tag>
    //     ))}
    //   </>
    // )
    // },
    {
      title: t('productsPage.updated'),
      dataIndex: 'updatedAt'
    },
    {
      title: t('productsPage.created'),
      dataIndex: 'createdAt'
    }
    // {
    // width: 40,
    // key: 'key'
    // render: (_, { _id }) => (
    // <Space>
    //   <Button icon={<EditFilled />} onClick={() => openEditProductModal(_id)} />
    //   <Button icon={<DeleteFilled />} onClick={() => removeProduct(_id)} />
    // </Space>
    // )
    // }
  ];

  return (
    <>
      <Helmet>
        <title>{t('title.dashboard')}</title>
        <meta name='description' content={t('description.dashboard')} />
      </Helmet>
      <Navigation />
      <Table
        columns={columns}
        dataSource={products}
        // onChange={productsTableChange}
        // pagination={{ total: productsTableData.count }}
        rowKey={(record) => record._id}
      />
    </>
  );
}
