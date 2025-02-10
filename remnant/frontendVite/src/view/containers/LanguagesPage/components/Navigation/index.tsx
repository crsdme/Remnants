import * as React from 'react';

import { useTranslation } from 'react-i18next';
import { useLanguageContext } from '@/utils/contexts';
import { Flex, Button } from 'antd';

import EditModal from './components/EditModal';

export default function Navigation() {
  const { t } = useTranslation();

  const languageContext = useLanguageContext();

  return (
    <>
      <Flex justify='end' style={{ marginBottom: 10 }}>
        <Button onClick={() => languageContext.openModal()}>{t('createLanguage')}</Button>
      </Flex>
      <EditModal />
    </>
  );
}
