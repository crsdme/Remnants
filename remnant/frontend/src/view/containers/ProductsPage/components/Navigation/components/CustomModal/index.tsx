import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Form, Button, Input, Select, InputNumber, Divider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  useRequestCurrencies,
  useRequestLanguages,
  useRequestUnits,
  useSearchCategories
} from '@/api/hooks';
import DebounceSelect from '@/view/components/DebounceSelect';

import { useProductContext } from '@/utils/contexts';
import i18n from '@/locales/i18n';

export default function EditProductPage() {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const productContext = useProductContext();

  const requestLanguages = useRequestLanguages({ pagination: { full: true } });

  const requestCurrencies = useRequestCurrencies({ pagination: { full: true } });

  const requestUnits = useRequestUnits({ pagination: { full: true } });

  const fetchCategories = useSearchCategories();

  const fetchCategoriesHandler = async (search: string) => {
    const { data } = await fetchCategories({
      filters: { names: search, language: i18n.language, flat: true },
      pagination: { current: 1, pageSize: 5 }
    });

    return data.categories;
  };

  useEffect(() => {
    if (productContext.selectedProduct) {
      form.setFieldsValue({ ...productContext.selectedProduct });
    } else {
      form.resetFields();
    }
  }, [productContext.selectedProduct, form]);

  return (
    <Modal
      title={t(`productPage.modal.title.${productContext.selectedProduct ? 'edit' : 'create'}`)}
      open={productContext.isModalOpen}
      confirmLoading={productContext.isLoading}
      onCancel={() => productContext.closeModal()}
      footer={[
        <Button
          type='primary'
          loading={productContext.isLoading}
          icon={<PlusOutlined />}
          onClick={() => form.submit()}
          key='create'
        >
          {t(`productPage.modal.button.${productContext.selectedProduct ? 'edit' : 'create'}`)}
        </Button>
      ]}
    >
      <Form
        form={form}
        layout='vertical'
        onFinish={(formData) => productContext.submitProductForm(formData)}
      >
        {requestLanguages.data.data.languages.map((language, key) => (
          <Form.Item
            label={t(`product.modal.form.name.${language.code}`)}
            name={['names', language.code]}
            key={key}
          >
            <Input />
          </Form.Item>
        ))}
        <Form.Item
          style={{
            marginBottom: 0
          }}
        >
          <Form.Item
            name='price'
            label={t('productsPage.productPrice')}
            rules={[{ required: true, message: t(`productsPage.requiredProductPrice`) }]}
            style={{
              display: 'inline-block',
              width: 'calc(50% - 4px)'
            }}
          >
            <InputNumber
              style={{ width: '100%' }}
              addonAfter={
                <Form.Item
                  name='currency'
                  noStyle
                  rules={[{ required: true, message: t(`productsPage.requiredProductCurrency`) }]}
                >
                  <Select
                    style={{ width: 50 }}
                    options={(requestCurrencies.data.data.currencies || []).map(
                      (currency, key) => ({
                        label: currency.symbols[i18n.language],
                        value: currency._id,
                        key
                      })
                    )}
                  />
                </Form.Item>
              }
            />
          </Form.Item>
          <Form.Item
            name='wholesalePrice'
            label={t('productsPage.wholesalePrice')}
            style={{
              display: 'inline-block',
              width: 'calc(50% - 4px)',
              margin: '0 0 0 8px'
            }}
          >
            <InputNumber
              style={{ width: '100%' }}
              addonAfter={
                <Form.Item name='wholesaleCurrency' noStyle>
                  <Select
                    style={{ width: 50 }}
                    options={(requestCurrencies.data.data.currencies || []).map(
                      (currency, key) => ({
                        label: currency.symbols[i18n.language],
                        value: currency._id,
                        key
                      })
                    )}
                  />
                </Form.Item>
              }
            />
          </Form.Item>
        </Form.Item>
        <Form.Item label={t('categoryPage.modal.categories')} name={'categories'}>
          <DebounceSelect
            fetchOptions={async (search) => await fetchCategoriesHandler(search)}
            mode='multiple'
          />
        </Form.Item>
        <Form.Item label={t('categoryPage.modal.units')} name={'units'}>
          <Select
            options={(requestUnits.data.data.units || []).map((unit, key) => ({
              label: unit.symbols[i18n.language],
              value: unit._id,
              key
            }))}
          />
        </Form.Item>
        <Divider orientation='left' orientationMargin='0'>
          {t('product.modal.devider.attributes')}
        </Divider>
        {/* uploadFile - dividerAttributes - customFieldGroups - customFields */}
      </Form>
    </Modal>
  );
}
