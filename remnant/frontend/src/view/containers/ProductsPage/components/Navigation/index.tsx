import * as React from 'react';

import { useTranslation } from 'react-i18next';
import { useProductContext } from '@/utils/contexts';
import { Flex, Button } from 'antd';

import CustomModal from './components/CustomModal';

export default function Navigation() {
  const { t } = useTranslation();

  const productContext = useProductContext();

  return (
    <>
      <Flex justify='end' style={{ marginBottom: 10 }}>
        <Button onClick={() => productContext.openModal()}>{t('createProduct')}</Button>
      </Flex>
      <CustomModal />
    </>
  );
}
