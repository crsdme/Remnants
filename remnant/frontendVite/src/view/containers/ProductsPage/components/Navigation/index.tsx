import * as React from 'react';

import { useTranslation } from 'react-i18next';
import { Space, Button } from 'antd';

import CreateProductModal from './components/CreateProductModal';

export default function Navigation() {
  const { t } = useTranslation();
  // const selectedLanguage = 'en';

  // const editProduct = useEditProduct({ filters: [] });
  return (
    <>
      <Space>
        <Button onClick={() => console.log(123)}>{t('createProduct')}</Button>
      </Space>
      <CreateProductModal />
    </>
  );
}
