import React, { useEffect, useState } from 'react';
import { Space, Layout, Table, Button, Col, Row, Form, Input, Typography, Flex, Modal, Select, Tag } from 'antd';
import { 
    EditFilled,
    DeleteFilled,
    PlusOutlined,
    CloseOutlined,
    UnorderedListOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import request from '../../../utils/requests';
import BarcodeScanner from '../../../utils/barcodeScanner';
import ProductTable from '../../components/ProductTable';
import SelectProductTable from '../../components/SelectProductTable';

const { Content } = Layout;
const { Title } = Typography;

export default function Page({ props }) {
    const { t } = useTranslation();
    const [form] = Form.useForm();

    const [editingPurchase, setEditingPurchase] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isToStock, setIsToStock] = useState(true);
    const [purchases, setPurchases] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);

    const { tokens, profile } = useSelector((state) => state.auth);
    const { languages, selectedLanguage } = useSelector((state) => state.theme);
    const params = { userId: profile._id, tokens }

    const createPurchase = async () => {
        const { stock, type, comment } = form.getFieldsValue();
        const { status, data } = await request.createPurchase({ stock, type, comment, products: selectedProducts }, params);
        if (status === 'success') {
            setPurchases(state => [data, ...state])
            closeModal();
        }
    }

    const editPurchase = async () => {
        const { stock, type, comment } = form.getFieldsValue();
        const { status } = await request.editPurchase({ _id: editingPurchase, stock, type, comment }, params);
        if (status === 'success') {
            getPurchases();
            closeModal();
        }
    }

    const removePurchase = async (_id) => {
        const { status } = await request.removePurchase({ _id }, params);
        if (status === 'success') getPurchases(); // CAN BE REWRITED BUT HAVE PROBLEM WITH REMOVE CHILD
        // setAttributes(state => state.filter(item => item._id !== _id));
    }

    const getPurchases = async () => {
        const { status, data } = await request.getPurchases({}, params);
        if (status === 'success') {
            setPurchases(data.purchases);
        }
    }

    const addProduct = async (product, quantity = 1) => {
        setSelectedProducts(state => {
            const productIndex = state.findIndex(item => item._id === product._id);

            if (productIndex !== -1) {
                const updatedProducts = [...state];
                updatedProducts[productIndex] = {
                    ...updatedProducts[productIndex],
                    quantity: updatedProducts[productIndex].quantity + quantity
                };
                return updatedProducts;
            }

            return [...state, { ...product, quantity: quantity }];
        });
    }

    const removeProduct = (_id) => {
        setSelectedProducts(state => state.filter((item) => item._id !== _id));
    }


    const openCreateModal = () => {
        setIsModalOpen(true);
    }

    const openEditModal = (_id) => {
        setIsModalOpen(!isModalOpen);
        setEditingPurchase(_id);
        const purchase = purchases.find(item => item._id === _id);
        form.setFieldsValue(purchase);
    }

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingPurchase(null);
        form.resetFields();
    }

    useEffect(() => {
        getPurchases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const columns = [
        {
            title: t('purchasesPage.id'),
            dataIndex: 'id',
            key: 'key'
        },
        {
            title: t('purchasesPage.status'),
            dataIndex: 'status',
            key: 'key',
        },
        {
            title: t('purchasesPage.stock'),
            dataIndex: 'stock',
            key: 'key',
        },
        {
            title: t('purchasesPage.type'),
            dataIndex: 'type',
            key: 'key',
        },
        
        {
            title: t('purchasesPage.comment'),
            dataIndex: 'comment',
            key: 'key',
        },
        {
            width: 40,
            key: 'key',
            render: (_, { _id, type }) => <Space>
            <Button icon={<EditFilled />} onClick={() => openEditModal(_id)} />
            <Button icon={<DeleteFilled />} onClick={() => removePurchase(_id)} />
            </Space>
        },
    ];

    const handleBarcodeScanned = async (code) => {
        const { status, data } = await request.getBarcodes({ filter: { code, single: true } }, params);
        for (const product of data.barcode.products) {
            addProduct(product._id, product.quantity)
        }
    };

    return (
        <Content style={{ margin: 20 }}>
            <BarcodeScanner onBarcodeScanned={handleBarcodeScanned} />
            <Row style={{ height: 50 }}>
                <Col span={4}>
                    <Flex justify='start' align='center' style={{ height: '100%' }}>
                        <Title style={{ margin: 0 }} level={4}>{t('purchasesPage.title')}</Title>
                    </Flex>
                </Col>
                <Col span={17}>
                </Col>
                <Col span={3}>
                    <Flex justify='start' align='center' style={{ height: '100%' }}>
                        <Button block icon={<PlusOutlined />} onClick={() => openCreateModal()} >{t('purchasesPage.create')}</Button>
                    </Flex>
                </Col>
            </Row>
            <Table 
                columns={columns}
                dataSource={purchases}
            />

            <Modal 
                title={true ? t('purchasesPage.edit.title') : t('purchasesPage.create.title')}
                open={isModalOpen} 
                width={'95%'}
                centered
                onOk={() => form.submit()}
                onCancel={() => closeModal()}
            >
                <ProductTable
                    addProduct={addProduct}
                />
                <Form form={form} onFinish={async () => editingPurchase ? await editPurchase() : await createPurchase()} layout='vertical'>
                    <Form.Item 
                        name="stock" 
                        label={t('purchasesPage.stock')}
                    >
                        <Select
                            optionFilterProp="label"
                            options={(props.stocks || []).map(item => ({
                                value: item._id,
                                label: item.names[selectedLanguage]
                            }))}
                        />
                    </Form.Item>
                    <Form.Item 
                        name="toStock"
                        label={t('purchasesPage.toStock')}
                    >
                        <Select
                            optionFilterProp="label"
                            disabled={isToStock}
                            options={(props.stocks || []).map(item => ({
                                value: item._id,
                                label: item.names[selectedLanguage]
                            }))}
                        />
                    </Form.Item>
                    <Form.Item 
                        name="type" 
                        label={t('purchasesPage.type')}
                    >
                        <Select
                            optionFilterProp="label"
                            onChange={v => setIsToStock(v !== 'move')}
                            options={[
                                {
                                    value: 'add',
                                    label: t('purchasesPage.type.add')
                                },
                                {
                                    value: 'remove',
                                    label: t('purchasesPage.type.remove')
                                },
                                {
                                    value: 'move',
                                    label: t('purchasesPage.type.move')
                                }
                            ]}
                        />
                    </Form.Item>
                    <Form.Item 
                        name="comment" 
                        label={t('purchasesPage.comment')}
                    >
                        <Input />
                    </Form.Item>
                </Form>
                <SelectProductTable
                    products={selectedProducts}
                    removeProduct={removeProduct}
                />
            </Modal>
        </Content>
    );
}