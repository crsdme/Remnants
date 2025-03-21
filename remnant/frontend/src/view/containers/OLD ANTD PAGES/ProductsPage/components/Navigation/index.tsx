import * as React from 'react';

import { useTranslation } from 'react-i18next';
import { Button, Flex } from 'antd';

import CustomModal from './components/CustomModal';

import { useProductContext } from '@/utils/contexts';

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
