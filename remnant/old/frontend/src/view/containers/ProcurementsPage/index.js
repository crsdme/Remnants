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
import SelectProductTable from '../../components/SelectProductTable';

const { Content } = Layout;
const { Title } = Typography;

export default function Page() {
    const { t } = useTranslation();
    const [form] = Form.useForm();

    const [editingProcurement, setEditingProcurement] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [procurements, setProcurements] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);

    const { tokens, profile } = useSelector((state) => state.auth);
    const { languages, selectedLanguage } = useSelector((state) => state.theme);
    const params = { userId: profile._id, tokens }

    const createProcurement = async () => {
        const { stock, type, comment } = form.getFieldsValue();
        const { status, data } = await request.createProcurement({ stock, type, comment, products: selectedProducts }, params);
        if (status === 'success') {
            setProcurements(state => [data, ...state])
            closeModal();
        }
    }

    const editProcurement = async () => {
        const { stock, type, comment } = form.getFieldsValue();
        const { status } = await request.editProcurement({ _id: editingProcurement, stock, type, comment }, params);
        if (status === 'success') {
            getProcurements();
            closeModal();
        }
    }

    const removeProcurement = async (_id) => {
        const { status } = await request.removeProcurement({ _id }, params);
        if (status === 'success') getProcurements(); // CAN BE REWRITED BUT HAVE PROBLEM WITH REMOVE CHILD
        // setAttributes(state => state.filter(item => item._id !== _id));
    }

    const getProcurements = async () => {
        const { status, data } = await request.getProcurements({}, params);
        if (status === 'success') {
            getProcurements(data.procurements);
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
        setEditingProcurement(_id);
        const procurement = procurements.find(item => item._id === _id);
        form.setFieldsValue(procurement);
    }

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProcurement(null);
        form.resetFields();
    }

    useEffect(() => {
        getProcurements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const columns = [
        {
            title: t('procurementsPage.id'),
            dataIndex: 'id',
            key: 'key'
        },
        {
            title: t('procurementsPage.stock'),
            dataIndex: 'stock',
            key: 'key',
        },
        {
            title: t('procurementsPage.type'),
            dataIndex: 'type',
            key: 'key',
        },
        
        {
            title: t('procurementsPage.comment'),
            dataIndex: 'comment',
            key: 'key',
        },
        {
            width: 40,
            key: 'key',
            render: (_, { _id, type }) => <Space>
            <Button icon={<EditFilled />} onClick={() => openEditModal(_id)} />
            <Button icon={<DeleteFilled />} onClick={() => removeProcurement(_id)} />
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
                        <Title style={{ margin: 0 }} level={4}>{t('procurementsPage.title')}</Title>
                    </Flex>
                </Col>
                <Col span={17}>
                </Col>
                <Col span={3}>
                    <Flex justify='start' align='center' style={{ height: '100%' }}>
                        <Button block icon={<PlusOutlined />} onClick={() => openCreateModal()} >{t('procurementsPage.create')}</Button>
                    </Flex>
                </Col>
            </Row>
            <Table 
                columns={columns}
                dataSource={procurements}
            />

            <Modal 
                title={true ? t('procurementsPage.edit.title') : t('procurementsPage.create.title')}
                open={isModalOpen} 
                width={'95%'}
                centered
                onOk={() => form.submit()}
                onCancel={() => closeModal()}
            >
                <ProductTable
                    addProduct={addProduct}
                />
                <Form form={form} onFinish={async () => editingProcurement ? await editProcurement() : await createProcurement()} layout='vertical'>
                    <Form.Item 
                        name="code" 
                        label={t('procurementsPage.code')}
                    >
                        <InputNumber style={{ width: '100%' }} />
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