import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Form, Button, Input, Checkbox } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { useLanguageContext } from '@/utils/contexts';

export default function EditLanguagePage() {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const languageContext = useLanguageContext();

  useEffect(() => {
    if (languageContext.selectedLanguage) {
      form.setFieldsValue({ ...languageContext.selectedLanguage });
    } else {
      form.resetFields();
    }
  }, [languageContext.selectedLanguage, form]);

  return (
    <Modal
      title={t('languagePage.modal.title')}
      open={languageContext.isModalOpen}
      confirmLoading={languageContext.isLoading}
      onCancel={() => languageContext.closeModal()}
      footer={[
        <Button
          type='primary'
          loading={languageContext.isLoading}
          icon={<PlusOutlined />}
          onClick={() => form.submit()}
          key='create'
        >
          {t('languagePage.modal.accept')}
        </Button>
      ]}
    >
      <Form
        form={form}
        layout='vertical'
        onFinish={(formData) => languageContext.submitLanguageForm(formData)}
      >
        <Form.Item label={t('language.modal.form.name')} name={'name'}>
          <Input />
        </Form.Item>
        <Form.Item label={t('language.modal.form.code')} name={'code'}>
          <Input />
        </Form.Item>
        <Form.Item label={t('language.modal.form.main')} name={'main'} valuePropName='checked'>
          <Checkbox />
        </Form.Item>
        <Form.Item label={t('language.modal.form.active')} name={'active'} valuePropName='checked'>
          <Checkbox />
        </Form.Item>
      </Form>
    </Modal>
  );
}
