import * as React from 'react';

import { useTranslation } from 'react-i18next';
import { useLanguageContext } from '@/utils/contexts';
import { Space, Button } from 'antd';

import EditModal from './components/EditModal';

export default function Navigation() {
  const { t } = useTranslation();

  const languageContext = useLanguageContext();

  // const editProduct = useEditProduct({ filters: [] });
  return (
    <>
      <Space>
        <Button onClick={() => languageContext.openModal()}>{t('createLanguage')}</Button>
      </Space>
      <EditModal />
    </>
  );
}
