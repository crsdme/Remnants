import React, { useEffect, useState } from 'react';
import { Space, Layout, Table, Button, Col, Row, Form, Input, Typography, InputNumber, Flex, Modal, Checkbox, Select, Tag } from 'antd';
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

const { Content } = Layout;
const { Title } = Typography;

export default function Page() {
    const { t } = useTranslation();
    const [form] = Form.useForm();

    const [editingBarcode, setEditingBarcode] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [barcodes, setBarcodes] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);

    const { tokens, profile } = useSelector((state) => state.auth);
    const { languages, selectedLanguage } = useSelector((state) => state.theme);
    const params = { userId: profile._id, tokens }

    const createBarcode = async () => {
        const { code, products } = form.getFieldsValue();
        const { status, data } = await request.createBarcode({ code, products: selectedProducts }, params);
        if (status === 'success') {
            setBarcodes(state => [data, ...state])
            closeModal();
        }
    }

    const editBarcode = async () => {
        const { code, products } = form.getFieldsValue();
        const { status } = await request.editAttribute({ _id: editingBarcode, code, products }, params);
        if (status === 'success') {
            getBarcodes();
            closeModal();
        }
    }

    const removeBarcode = async (_id) => {
        const { status } = await request.removeBarcode({ _id }, params);
        if (status === 'success') getBarcodes(); // CAN BE REWRITED BUT HAVE PROBLEM WITH REMOVE CHILD
        // setAttributes(state => state.filter(item => item._id !== _id));
    }

    const getBarcodes = async () => {
        const { status, data } = await request.getBarcodes({}, params);
        if (status === 'success') {
            setBarcodes(data.barcodes);
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


    const openCreateModal = () => {
        setIsModalOpen(true);
    }

    const openEditModal = (_id) => {
        setIsModalOpen(!isModalOpen);
        setEditingBarcode(_id);
        const barcode = barcodes.find(item => item._id === _id);
        form.setFieldsValue(barcode);
    }

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingBarcode(null);
        form.resetFields();
    }

    useEffect(() => {
        getBarcodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const columns = [
        {
            title: t('barcodesPage.code'),
            dataIndex: 'code',
            key: 'key'
        },
        {
            title: t('barcodesPage.products'),
            dataIndex: 'products',
            key: 'key',
            render: (products) => <>{ products.map(item => <Tag>{ `${(item?._id?.names?.[selectedLanguage] || item._id)} - ${item.quantity}` }</Tag>) }</>
        },
        {
            title: t('barcodesPage.createdAt'),
            dataIndex: 'createdAt',
            key: 'key',
        },
        {
            width: 40,
            key: 'key',
            render: (_, { _id, type }) => <Space>
            <Button icon={<EditFilled />} onClick={() => openEditModal(_id)} />
            <Button icon={<DeleteFilled />} onClick={() => removeBarcode(_id)} />
            </Space>
        },
    ];

    const handleBarcodeScanned = async (code) => {
        const { status, data } = await request.getBarcodes({ filter: { code, single: true } }, params);
        for (const product of data.barcode.products) {
            addProduct(product._id, product.quantity)
        }

        console.log(selectedProducts)
    };

    return (
        <Content style={{ margin: 20 }}>
            <BarcodeScanner onBarcodeScanned={handleBarcodeScanned} />
            <Row style={{ height: 50 }}>
                <Col span={4}>
                    <Flex justify='start' align='center' style={{ height: '100%' }}>
                        <Title style={{ margin: 0 }} level={4}>{t('barcodesPage.title')}</Title>
                    </Flex>
                </Col>
                <Col span={17}>
                </Col>
                <Col span={3}>
                    <Flex justify='start' align='center' style={{ height: '100%' }}>
                        <Button block icon={<PlusOutlined />} onClick={() => openCreateModal()} >{t('barcodesPage.create')}</Button>
                    </Flex>
                </Col>
            </Row>
            <Table 
                columns={columns}
                dataSource={barcodes}
            />

            <Modal 
                title={true ? t('barcodesPage.edit.title') : t('barcodesPage.create.title')}
                open={isModalOpen} 
                width={'95%'}
                centered
                onOk={() => form.submit()}
                onCancel={() => closeModal()}
            >
                <ProductTable
                    addProduct={addProduct}
                />
                <Form form={form} onFinish={async () => editingBarcode ? await editBarcode() : await createBarcode()} layout='vertical'>
                    <Form.Item 
                        name="code" 
                        label={t('barcodesPage.code')}
                    >
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </Content>
    );
}