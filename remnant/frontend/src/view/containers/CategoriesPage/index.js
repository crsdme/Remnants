import React, { useEffect, useState } from 'react';
import { Space, Layout, Table, Button, Col, Row, Form, Input, Typography, Flex, Modal, TreeSelect } from 'antd';
import { 
    EditFilled,
    DeleteFilled,
    PlusOutlined,
    DownOutlined,
    UpOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import request from '../../../utils/requests';

const { Content, Header } = Layout;
const { Title } = Typography;

export default function Page() {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const [editingCategory, setEditingCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormClosed, setIsFormClosed] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [categories, setCategories] = useState([]);

  
  const { tokens, profile } = useSelector((state) => state.auth);
  const params = { userId: profile._id, tokens }

  // const data = [
  //     {
  //       "id": 4,
  //       "_id": 4,
  //       "names": {
  //         ru: "\u0422\u0430\u0431\u0430\u043a",
  //         ua: "\u0422\u0430\u0431\u0430\u043a",
  //         en: "\u0422\u0430\u0431\u0430\u043a",
  //         tr: "\u0422\u0430\u0431\u0430\u043a",
  //       },
  //       "_lft": 1,
  //       "_rgt": 8,
  //       "parent_id": null,
  //       "depth": 0,
  //     },
  //     {
  //       "id": 5,
  //       "_id": 5,
  //       "names": {
  //         ru: "Jibiar",
  //         ua: "Jibiar",
  //         en: "Jibiar",
  //         tr: "Jibiar",
  //       },
  //       "_lft": 2,
  //       "_rgt": 7,
  //       "parent_id": 4,
  //       "depth": 1,
  //     },
  //     {
  //       "id": 9,
  //       "_id": 9,
  //       "names": {
  //         ru: "50 \u0433\u0440\u0430\u043c\u043c",
  //         ua: "50 \u0433\u0440\u0430\u043c\u043c",
  //         en: "50 \u0433\u0440\u0430\u043c\u043c",
  //         tr: "50 \u0433\u0440\u0430\u043c\u043c",
  //       },
  //       "_lft": 3,
  //       "_rgt": 6,
  //       "parent_id": 5,
  //       "depth": 2,
  //     },
  //     {
  //       "id": 10,
  //       "_id": 10,
  //       "names": {
  //         ru: "\u0424\u0430\u0441\u043e\u0432\u043a\u0430",
  //         ua: "\u0424\u0430\u0441\u043e\u0432\u043a\u0430",
  //         en: "\u0424\u0430\u0441\u043e\u0432\u043a\u0430",
  //         tr: "\u0424\u0430\u0441\u043e\u0432\u043a\u0430",
  //       },
  //       "_lft": 4,
  //       "_rgt": 5,
  //       "parent_id": 9,
  //       "depth": 3,
  //     },
  //     {
  //       "id": 6,
  //       "_id": 6,
  //       "names": {
  //         ru: "\u0428\u0430\u0440",
  //         ua: "\u0428\u0430\u0440",
  //         en: "\u0428\u0430\u0440",
  //         tr: "\u0428\u0430\u0440",
  //       },
  //       "_lft": 9,
  //       "_rgt": 14,
  //       "parent_id": null,
  //       "depth": 0,
  //     },
  //     {
  //       "id": 7,
  //       "_id": 7,
  //       "names": {
  //         ru: "\u0411\u043e\u043b\u044c\u0448\u0438\u0435",
  //         ua: "\u0411\u043e\u043b\u044c\u0448\u0438\u0435",
  //         en: "\u0411\u043e\u043b\u044c\u0448\u0438\u0435",
  //         tr: "\u0411\u043e\u043b\u044c\u0448\u0438\u0435",
  //       },
  //       "_lft": 10,
  //       "_rgt": 11,
  //       "parent_id": 6,
  //       "depth": 1,
  //     },
  //     {
  //       "id": 8,
  //       "_id": 8,
  //       "names": {
  //         ru: "\u0421\u0440\u0435\u0434\u043d\u0438\u0435",
  //         ua: "\u0421\u0440\u0435\u0434\u043d\u0438\u0435",
  //         en: "\u0421\u0440\u0435\u0434\u043d\u0438\u0435",
  //         tr: "\u0421\u0440\u0435\u0434\u043d\u0438\u0435",
  //       },
  //       "_lft": 12,
  //       "_rgt": 13,
  //       "parent_id": 6,
  //       "depth": 1,
  //     },
  // ];      

  const createCategory = () => {
    const { names, parent } = form.getFieldsValue();
    console.log(names, parent)
  } 

  const editCategory = (_id) => {
      console.log(_id)
  }

  const removeCategory = (_id) => {
      console.log(_id)
  }

  const getCategories = async () => {
    const { status, data } = await request.getCategories({}, params);
    console.log(data)
    if (status === 'success') {
        setCategories(data.categories);
    }
  }

  const getLanguages = async () => {
    const { status, data } = await request.getLanguages({ filters: null }, params);
    if (status === 'success') {
        setLanguages(data.languages);
    }
  }



  const openCreateCategoryModal = () => {
      setIsModalOpen(true);
  }

  const openEditCategoryModal = (_id) => {
      setIsModalOpen(!isModalOpen);
      setEditingCategory(_id)
  }

  const closeCategoryModal = () => {
      setIsModalOpen(false);
      setEditingCategory(null);
  }

  useEffect(() => {
    getLanguages();
    getCategories();
  }, [])

  const columns = [
      {
        title: t('categoryPage.name'),
        dataIndex: ['names', 'ru'],
        key: 'key'
      },
      {
        width: 40,
        key: 'key',
        render: (_, { _id }) => <Space>
          <Button icon={<EditFilled />} onClick={() => openEditCategoryModal(_id)} />
          <Button icon={<DeleteFilled />} onClick={() => removeCategory(_id)} />
        </Space>
      },
  ];

  return (<Content style={{ margin: 20 }}>
      <Row style={{ height: 50 }}>
          <Col span={4}>
              <Flex justify='start' align='center' style={{ height: '100%' }}>
                  <Title style={{ margin: 0 }} level={4}>{t('categoryPage.title')}</Title>
              </Flex>
          </Col>
          <Col span={17}>
          </Col>
          <Col span={3}>
              <Flex justify='start' align='center' style={{ height: '100%' }}>
                  <Button block icon={<PlusOutlined />} onClick={() => openCreateCategoryModal()} >{t('categoryPage.create')}</Button>
              </Flex>
          </Col>
      </Row>
      <Table 
          columns={columns}
          dataSource={categories}
      />

      <Modal 
          title={t('categoryPage.create.title')}
          open={isModalOpen} 
          // onOk={handleOk} 
          width={400}
          centered
          onOk={() => form.submit()}
          onCancel={() => closeCategoryModal()}
      >
          <Form form={form} onFinish={() => createCategory()} layout='vertical'>
            { languages.map(language => <Form.Item name={['names', language.code]} label={t(`categoryPage.name.${language.code}`)}>
              <Input />
            </Form.Item>) }
              {/* <Form.Item>
                <Button icon={isFormClosed ? <DownOutlined /> : <UpOutlined />} style={{ width: '100%' }} onClick={() => setIsFormClosed(!isFormClosed)} />
              </Form.Item> */}
              <Form.Item name="parent" label={t('categoryPage.parentCategory')} rules={[{ required: true }]}>
                  <TreeSelect
                      showSearch
                      dropdownStyle={{
                          maxHeight: 400,
                          overflow: 'auto',
                      }}
                      placeholder={t('categoryPage.select.category')}
                      allowClear
                      treeDefaultExpandAll
                      treeData={ languages
                          .map(item => item._id !== editingCategory ? { title: item.names['ru'], value: item._id } : undefined)
                          .filter(item => item !== undefined)
                      }  
                  />
              </Form.Item>
          </Form>
      </Modal>

  </Content>);
}