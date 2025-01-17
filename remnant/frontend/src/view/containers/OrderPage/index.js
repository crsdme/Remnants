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
import { useParams, useSearchParams } from "react-router-dom";
import { useSelector } from 'react-redux';
import request from '../../../utils/requests';
import ProductTable from '../../components/ProductTable';
import SelectProductTable from '../../components/SelectProductTable';
import BarcodeScanner from '../../../utils/barcodeScanner';
import TextArea from 'antd/es/input/TextArea';

const { Content } = Layout;

export default function Page({ props }) {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const type = searchParams.get("type");

    const [order, setOrder] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);

    const { tokens, profile } = useSelector((state) => state.auth);
    const { languages, selectedLanguage } = useSelector((state) => state.theme);
    const params = { userId: profile._id, tokens }

    const getOrder = async () => {
        const { status, data } = await request.getOrders({}, params);
        if (status === 'success') {
            setOrder(data.order);
        }
    }

    const createOrder = async () => {
        const { stock, source, orderStatus, deliveryService, comment } = form.getFieldsValue();
        const { status, data } = await request.createOrder({ stock, source, orderStatus, deliveryService, comment, product: selectedProducts }, params);
        console.log(status)
    }

    const editOrder = async () => {
        // const { status, data } = await request.editOrder({}, params);
        console.log('edit')
    }

    const acceptOrder = async () => {
        // const { status, data } = await request.editOrder({}, params);
        console.log('accept')
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

    const handleBarcodeScanned = async (code) => {
        const { status, data } = await request.getBarcodes({ filter: { code, single: true } }, params);
        for (const product of data.barcode.products) {
            addProduct(product._id, product.quantity)
        }
    };

    const actions = {
        'create': createOrder,
        'edit': editOrder,
        'accept': acceptOrder,
        'view': () => {},
    }

    useEffect(() => {
        getOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Content style={{ margin: 20 }}>
            <BarcodeScanner onBarcodeScanned={handleBarcodeScanned} />
            <ProductTable addProduct={addProduct} />
            <Form form={form} onFinish={async () => actions[type]} layout='vertical'>
                <Form.Item 
                    name="stock" 
                    label={t('orderPage.stock')}
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
                    name="source" 
                    label={t('orderPage.source')}
                >
                    <Select
                        optionFilterProp="label"
                        options={(props.sources || []).map(item => ({
                            value: item._id,
                            label: item.names[selectedLanguage]
                        }))}
                    />
                </Form.Item>
                <Form.Item 
                    name="orderStatus" 
                    label={t('orderPage.orderStatus')}
                >
                    <Select
                        optionFilterProp="label"
                        options={(props.orderStatuses || []).map(item => ({
                            value: item._id,
                            label: item.names[selectedLanguage]
                        }))}
                    />
                </Form.Item>
                <Form.Item 
                    name="deliveryService" 
                    label={t('orderPage.deliveryService')}
                >
                    <Select
                        optionFilterProp="label"
                        options={(props.deliveryServices || []).map(item => ({
                            value: item._id,
                            label: item.names[selectedLanguage]
                        }))}
                    />
                </Form.Item>
                <Form.Item 
                    name="comment" 
                    label={t('orderPage.comment')}
                >
                    <TextArea />
                </Form.Item>
                <Form.Item label={null}>
                    <Button type="primary" htmlType="submit" onClick={actions[type]}>
                        {t(`orderPage.button.${type}`)}
                    </Button>
                </Form.Item>
            </Form>
            { id }
            { type }
            <SelectProductTable
                products={selectedProducts}
                removeProduct={removeProduct}
            />
        </Content>
    );
}