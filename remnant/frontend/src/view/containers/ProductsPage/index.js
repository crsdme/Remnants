import React, { useState, useEffect } from 'react';
import { Image, Space, Layout, Table, Tag, Button, InputNumber, Select, Modal, Form, Input } from 'antd';
import { 
    PlusOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import placeholder from '../../images/placeholder.jpg';
import request from '../../../utils/requests';

const { Content } = Layout;

export default function Page() {

    // const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [openProductModal, setOpenProductModal] = useState(false);
    const [form] = Form.useForm();

    const { t } = useTranslation();

    const { tokens, profile } = useSelector((state) => state.auth);
    const { currencies, languages, selectedLanguage } = useSelector((state) => state.theme);
    const params = { userId: profile._id, tokens }

    const createProduct = async (v) => {
        console.log(v)
    }

    const getProducts = async (value) => {
        const { status, data } = await request.getProducts(value, params);
        if (status === 'success') setProducts(data.products);
    }

    const getCategories = async (value) => {
        const { status, data } = await request.getCategories({}, params);
        if (status === 'success') setCategories(data.categories);
    }

    useEffect(() => {
        getProducts({});
        getCategories();
    }, [])

    const columns = [
        { 
            title: t('product.image'), 
            render: (text, { images }) => <div className="productImages">
              <Image.PreviewGroup>
                {
                  images && images.length > 0 ?
                  images.map((image, key) => 
                    <Image 
                      key={key} 
                      className="productImage" 
                      width={70} 
                      src={process.env.REACT_APP_BACK_URL + 'uploads/' + image.url} 
                      onError={() => {
                        console.log('Image loading failed.');
                      }}
                      fallback={placeholder}
                    />
                  )
                  :
                  <Image className="productImage" width={70} src={placeholder} />
                }
              </Image.PreviewGroup>
            </div>
        },
        {
            title: t('product.name'),
            dataIndex: 'name',
        },
        {
            title: t('product.price'),
            dataIndex: 'price',
        },
        {
            title: t('product.wholesalePrice'),
            dataIndex: 'wholesaleprice',
        },
        {
            title: t('product.quantity'),
            dataIndex: 'quantity',
        },
        {
            title: t('product.reserve'),
            dataIndex: 'reserve',
        },
        {
            title: t('product.category'),
            dataIndex: 'category',
            render: (_, { tags }) => (
                <>
                {tags.map((tag, key) => {
                    let color = tag.length > 5 ? 'geekblue' : 'green';
                    if (tag === 'loser') {
                    color = 'volcano';
                    }
                    return (
                    <Tag color={color} key={key}>
                        {tag.toUpperCase()}
                    </Tag>
                    );
                })}
                </>
            ),
        },
        {
            title: t('product.updated'),
            dataIndex: 'updatedAt',
            // render: (text) => <>{moment(text).format("DD.MM.YYYY HH:mm:ss")}</>
        },
        {
            title: t('product.created'),
            dataIndex: 'createdAt',
            // render: (text) => <>{moment(text).format("DD.MM.YYYY HH:mm:ss")}</>
        },
        {
          render: (_, record) => (
            <Space size="middle">
              <a>Invite {record.name}</a>
              <a>Delete</a>
            </Space>
          ),
        },
    ];

    return (<>
        <Content style={{ margin: '8px 16px', backgroundColor: 'white' }} >
            <Space.Compact style={{ padding: 8, float: 'right' }}>
                <Button icon={<PlusOutlined />} type="primary" onClick={() => setOpenProductModal(true)}/>
            </Space.Compact>
            <Table 
                columns={columns} 
                dataSource={products} 
                rowKey={(record) => record._id}
            />
        </Content>

        <Modal
            title={t('createProduct')}
            open={openProductModal}
            confirmLoading={false}
            onCancel={() => setOpenProductModal(false)}
            footer={[
                <Button
                  type="primary"
                  loading={false}
                  icon={<PlusOutlined />}
                  onClick={() => form.submit()}
                >
                  { t('createProduct') }
                </Button>,
            ]}
        >
            <Form form={form} layout='vertical' onFinish={(v) => createProduct(v)}>
                {
                    languages.all.map((item, key) => 
                    <Form.Item
                        key={key}
                        label={`name${item.code}`}
                        name={`name${item.code}`}   
                        rules={[{ required: item.main, message: t(`requiredProductName`) }]}
                    >
                        <Input />
                    </Form.Item>
                    )
                }
                <Form.Item
                    name="price"
                    label={t('price')}
                    rules={[{ required: true, message: t(`requiredProductPrice`) }]}
                >
                <InputNumber 
                    style={{width: '100%'}} 
                    addonAfter={
                    <Form.Item 
                        name="priceCurrency" 
                        noStyle
                        rules={[{ required: true, message: t(`requiredProductPriceCurrency`) }]}
                    >
                        <Select
                            style={{width: 50}}
                            options={(currencies.all || []).map(currency => ({
                                label: currency.symbol,
                                value: currency._id
                            }))}
                        />
                    </Form.Item>
                    } />
                </Form.Item>
                <Form.Item
                    name="wholesalePrice"
                    label={t('wholesalePrice')}
                >
                <InputNumber 
                    style={{width: '100%'}} 
                    addonAfter={
                    <Form.Item name="wholesaleCurrency" noStyle>
                        <Select
                        style={{width: 50}}
                        options={(currencies.all || []).map(currency => ({
                            label: currency.symbol,
                            value: currency._id
                        }))}
                        />
                    </Form.Item>
                    } />
                </Form.Item>
                <Form.Item 
                    name="categories" 
                    rules={[{ required: true, message: t(`requiredProductCategories`) }]}
                >
                    <Select
                        options={(categories || []).map(category => ({
                            label: category.names[selectedLanguage],
                            value: category._id
                        }))}
                    />
                </Form.Item>
            </Form>

        </Modal>
    </>);
}