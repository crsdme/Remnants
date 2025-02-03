import * as React from 'react';

import { useTranslation } from 'react-i18next';
import { Modal, Form, Button, InputNumber, Select, Input, Divider } from 'antd';
import { PlusOutlined, DeleteFilled, EditFilled, UploadOutlined } from '@ant-design/icons';
// import { useRequestProducts } from '@/utils/api/hooks';
// import { backendUrl } from '@/utils/constants';

interface CreateProductModalProps {
  openModal: boolean;
  handleModal: () => void;
}

export default function CreateProductModal(props: CreateProductModalProps) {
  const { t } = useTranslation();
  const selectedLanguage = 'en';

  const [form] = Form.useForm();

  // const editProduct = useEditProduct({ filters: [] });

  return (
    <>
      <h1>create product modal {`${props.openModal === true && '12313'}`}</h1>
      <Modal
        title={t('productsPage.createProductTitle')}
        open={props.openModal}
        confirmLoading={false}
        onCancel={props.handleModal}
        footer={[
          <Button
            type='primary'
            loading={false}
            icon={<PlusOutlined />}
            onClick={() => form.submit()}
            key='create'
          >
            {t('productsPage.createProductButton')}
          </Button>
        ]}
      >
        <Form
          form={form}
          layout='vertical'
          // onFinish={() => (createProduct())}
        >
          {/* {languages.all.map((item, key) => (
            <Form.Item
              key={key}
              label={`name${item.code}`}
              name={['names', item.code]}
              rules={[{ required: item.main, message: t(`productsPage.requiredProductName`) }]}
            >
              <Input />
            </Form.Item>
          ))} */}
          {/* <Form.Item
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
                      options={(currencies.all || []).map((currency, key) => ({
                        label: currency.symbol,
                        value: currency._id,
                        key
                      }))}
                    />
                  </Form.Item>
                }
              />
            </Form.Item> */}
          {/* <Form.Item
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
                      options={(currencies.all || []).map((currency, key) => ({
                        label: currency.symbol,
                        value: currency._id,
                        key
                      }))}
                    />
                  </Form.Item>
                }
              />
            </Form.Item>
          </Form.Item> */}
          {/* <Form.Item
            name='categories'
            // rules={[{ required: true, message: t(`requiredProductCategories`) }]}
            label={t('productsPage.categories')}
          >
            <TreeSelect
              // showSearch
              multiple={true}
              // onSearch={handleSearch}
              dropdownStyle={{
                maxHeight: 400,
                overflow: 'auto'
              }}
              placeholder={t('productsPage.select.category')}
              allowClear
              treeDefaultExpandAll={false}
              treeData={selectCategories}
            />
          </Form.Item> */}
          {/* <Form.Item label={t('productsPage.uploadFileTitle')}>
            <DndContext sensors={[sensor]} onDragEnd={onDragEnd}>
              <SortableContext
                items={fileList.map((i) => i.uid)}
                strategy={verticalListSortingStrategy}
              >
                <Upload
                  onChange={onChangeUpload}
                  fileList={fileList}
                  listType='picture'
                  customRequest={handleUpload}
                  itemRender={(originNode, file) => (
                    <DraggableUploadListItem originNode={originNode} file={file} />
                  )}
                >
                  <Button icon={<UploadOutlined />}>{t('productsPage.uploadFile')}</Button>
                </Upload>
              </SortableContext>
            </DndContext>
          </Form.Item> */}
          {/* <Form.Item
            label={t('productsPage.unit')}
            name={'unit'}
            rules={[{ required: true, message: t(`productsPage.requiredUnit`) }]}
          >
            <Select
              // onChange={(v) => changeCustomFieldGroup(v)}
              options={props.units.map((item) => ({
                value: item._id,
                label: item.names[selectedLanguage]
              }))}
            />
          </Form.Item> */}
          <Divider orientation='left'>{t('productsPage.dividerAttributes')}</Divider>
          {/* <Form.Item
            label={t('productsPage.customFieldGroups')}
            name={'customFieldsGroup'}
            rules={[{ required: true, message: t(`productsPage.requiredCustomFieldGroup`) }]}
          >
            <Select
              onChange={(v) => changeCustomFieldGroup(v)}
              options={props.customFieldGroups.map((item) => ({
                value: item._id,
                label: item.names[selectedLanguage]
              }))}
            />
          </Form.Item>
          {(selectedCustomFieldGroup || []).map((item, key) => (
            <Form.Item
              key={key}
              label={item.names[selectedLanguage]}
              name={['customFields', item._id]}
              rules={[{ required: item.main, message: t(`productsPage.requiredAttribute`) }]}
            >
              {item.type === 'text' ? (
                <Input />
              ) : (
                <Select
                  mode={item.is_multiple ? 'multiple' : 'default'}
                  options={item.options.map((item) => ({
                    value: item._id,
                    label: item.names[selectedLanguage]
                  }))}
                />
              )}
            </Form.Item>
          ))} */}
        </Form>
      </Modal>
    </>
  );
}
