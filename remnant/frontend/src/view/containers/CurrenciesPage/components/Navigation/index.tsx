import * as React from 'react';

import { useTranslation } from 'react-i18next';
import { Flex, Button } from 'antd';

import CustomModal from './components/CustomModal';
import { useCurrencyContext } from '@/utils/contexts';

export default function Navigation() {
  const { t } = useTranslation();

  const unitContext = useCurrencyContext();

  return (
    <>
      <Flex justify='end' style={{ marginBottom: 10 }}>
        <Button onClick={() => unitContext.openModal()}>{t('createCurrency')}</Button>
      </Flex>
      <CustomModal />
    </>
  );
}
