import React, { Children, useEffect, useState } from 'react';
import { Collapse , Layout, Table, Button, Col, Row, Form, Input, Segmented, List, InputNumber, Select, DatePicker, Divider } from 'antd';
import { 
    EditFilled,
    DeleteFilled,
    PlusOutlined,
    CloseOutlined,
    UnorderedListOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import request from '../../../utils/requests';
import ProductTable from '../../components/ProductTable';
import SelectProductTable from '../../components/SelectProductTable';
import BarcodeScanner from '../../../utils/barcodeScanner';
import debounce from '../../../utils/helpers';
import TextArea from 'antd/es/input/TextArea';
import dayjs from 'dayjs';

const { Content } = Layout;

export default function Page({ props }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [clientForm] = Form.useForm();
    const [paymentForm] = Form.useForm();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const type = searchParams.get("type");

    const [order, setOrder] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [clients, setClients] = useState([]);
    const [selectedCashregister, setSelectedCashregister] = useState(null);
    const [selectedCashregisterAccount, setSelectedCashregisterAccount] = useState(null);
    const [cashregisterAccounts, setCashregisterAccounts] = useState([]);
    const [allowedCurrencies, setAllowedCurrencies] = useState([]);

    const { tokens, profile } = useSelector((state) => state.auth);
    const { languages, selectedLanguage } = useSelector((state) => state.theme);
    const params = { userId: profile._id, tokens }

    const getOrder = async () => {
        if (!id) return;
        const { status, data } = await request.getOrders({ filter: { id } }, params);
        if (status === 'success') {
            const order = data.orders[0];
            setOrder(order);
            setSelectedProducts(order.products);
            console.log(order.products)
            form.setFieldsValue(order);
        }
    }

    const createOrder = async () => {
        const { stock, source, orderStatus, deliveryService, client, paymentStatus, comment } = form.getFieldsValue();
        const { status, data } = await request.createOrder({ stock, source, orderStatus, paymentStatus, deliveryService, client, comment, products: selectedProducts }, params);
        navigate('/orders');
    }

    const editOrder = async () => {
        const { stock, source, orderStatus, deliveryService, paymentStatus, client, comment } = form.getFieldsValue();
        const { status, data } = await request.editOrder({ id, stock, source, orderStatus, paymentStatus, deliveryService, client, comment, products: selectedProducts }, params);
        console.log(status, data)
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

    const searchClient = debounce(async (value) => {
        const { status, data } = await request.getClients(
            { filter: { search: value, language: selectedLanguage } },
            params
        );

        if (status === 'success') setClients(data.clients.map(item => ({ 
            label: `${item.name} ${item.middlename} ${item.lastname} ${item.id}`,
            value: item._id
         })));

        return true;
    });

    const createClient = async () => {
        const { name, middlename, lastname, emails, phones, dayofbirth, comment } = form.getFieldsValue();
        const { status, data } = await request.createClient({ name, middlename, lastname, emails, phones, dayofbirth, comment }, params);
    }

    const createOrderPayment = async () => {
        const { cashregister, cashregisterAccount, paymentStatus, amount, currency, paymentDate, comment } = paymentForm.getFieldsValue();
        const { status, data } = await request.createOrderPayment({ order: order._id, cashregister, cashregisterAccount, paymentStatus, amount, currency, paymentDate, comment }, params);
        getOrderPayments();
    }

    const removeOrderPayment = async (orderPayment) => {
        const { status, data } = await request.removeOrderPayment({ order: order._id, orderPayment }, params);
        getOrderPayments();
    }

    const getOrderPayments = async () => {
        const { status, data } = await request.getOrderPayments({ filter: { order: order._id } }, params);
        setOrder(state => ({ ...state, orderPayments: data.orderPayments  }))
    }

    const getCashregisterAccounts = async () => {
        const { status, data } = await request.getCashRegisterAccounts({ filter: { cashregister: selectedCashregister } }, params);
        if (status === 'success') {
            setCashregisterAccounts(data.cashregisterAccounts);
        }
    }

    useEffect(() => {
        getOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        getCashregisterAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCashregister]);

    useEffect(() => {
        const cashregisterAccount = cashregisterAccounts.find(item => item._id === selectedCashregisterAccount);
        const currenciesIds = (cashregisterAccount?.balance || []).map(item => item.currency);
        setAllowedCurrencies(currenciesIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCashregisterAccount]);

    return (
        <Content style={{ margin: '10px 10px 10px 20px', padding: 10, background: 'white', borderRadius: 8 }}>
            <BarcodeScanner onBarcodeScanned={handleBarcodeScanned} />
            <Collapse items={[{
                label: 'Add Products',
                children: <ProductTable addProduct={addProduct} />
            }]} />
            <SelectProductTable
                products={selectedProducts}
                removeProduct={removeProduct}
            />
            <Row gutter={[12, 12]}>
                <Col span={8}>
                    <Divider orientation="left" orientationMargin="0">Information</Divider>
                    <Form form={form} onFinish={actions[type]} layout='vertical'>
                        <Row gutter={[12, 0]}>

                            <Col span={12}>
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
                            </Col>
                            <Col span={12}>
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
                            </Col>
                            <Col span={12}>
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
                            </Col>
                            <Col span={12}>
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
                            </Col>
                            <Col span={24}>
                                <Form.Item 
                                    name="paymentStatus" 
                                    label={t('orderPage.paymentStatus')}
                                >
                                    <Select
                                        optionFilterProp="label"
                                        options={[
                                            {
                                                label: t('orderPage.paid'),
                                                value: 'paid'
                                            },
                                            {
                                                label: t('orderPage.notpaid'),
                                                value: 'notPaid'
                                            }
                                        ]}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item 
                                    name="client" 
                                    label={t('orderPage.clients')}
                                >
                                    <Select
                                        optionFilterProp="label"
                                        showSearch
                                        onSearch={searchClient}
                                        dropdownStyle={{
                                            maxHeight: 400,
                                            overflow: 'auto',
                                        }}
                                        placeholder={t('orderPage.select.clients')}
                                        allowClear
                                        treeDefaultExpandAll={false}
                                        options={clients}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item 
                                    name="comment" 
                                    label={t('orderPage.comment')}
                                >
                                    <TextArea />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={null}>
                                    <Button type="primary" htmlType="submit">
                                        {t(`orderPage.button.${type}`)}
                                    </Button>
                                </Form.Item>
                            </Col>

                        </Row>
                    </Form>
                </Col>
                <Col span={8}>
                    <Divider orientation="left" orientationMargin="0">Client</Divider>
                    <Form form={clientForm} onFinish={async () => createClient()} layout='vertical'>
                        <Row gutter={[12, 0]}>

                            <Col span={12}>
                                <Form.Item 
                                    name="name" 
                                    label={t('orderPage.name')}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item 
                                    name="middlename" 
                                    label={t('orderPage.middlename')}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item 
                                    name="lastname" 
                                    label={t('orderPage.lastname')}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item 
                                    name="dayOfBirth" 
                                    label={t('orderPage.dayOfBirth')}
                                >
                                    <DatePicker />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={null}>
                                    <Button type="primary" htmlType="submit">
                                        {t(`orderPage.button.${type}`)}
                                    </Button>
                                </Form.Item>
                            </Col>

                        </Row>
                    </Form>
                </Col>
                <Col span={8}>
                    {
                        ['edit', 'view'].includes(type) && <>
                            <Divider orientation="left" orientationMargin="0">Payment</Divider>
                            <Form form={paymentForm} onFinish={async () => createOrderPayment()} layout='vertical'>
                                <Row gutter={[12, 0]}>

                                    <Col span={12}>
                                        <Form.Item 
                                            name="cashregister" 
                                            label={t('orderPage.cashregister')}
                                        >
                                            <Select
                                                onChange={(v) => setSelectedCashregister(v)}
                                                optionFilterProp="label"
                                                options={(props.cashregisters || []).map(item => ({
                                                    value: item._id,
                                                    label: item.names[selectedLanguage]
                                                }))}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item 
                                            name="cashregisterAccount" 
                                            label={t('orderPage.cashregisterAccount')}
                                        >
                                            <Select
                                                onChange={(v) => setSelectedCashregisterAccount(v)}
                                                optionFilterProp="label"
                                                options={(cashregisterAccounts || []).map(item => ({
                                                    value: item._id,
                                                    label: item.names[selectedLanguage]
                                                }))}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name="amount"
                                            label={t('orderPage.amount')}
                                            style={{
                                                display: 'inline-block',
                                                width: 'calc(50% - 4px)',
                                            }}
                                        >
                                        <InputNumber 
                                            style={{width: '100%'}} 
                                            addonAfter={
                                            <Form.Item 
                                                name="currency" 
                                                noStyle
                                                rules={[{ required: true, message: t(`orderPage.currency`) }]}
                                            >
                                                <Select
                                                    style={{width: 50}}
                                                    options={(props.currencies || []).map((currency, key) => ({
                                                        label: currency.symbol,
                                                        value: currency._id,
                                                        disabled: !allowedCurrencies.includes(currency._id),
                                                        key
                                                    }))}
                                                />
                                            </Form.Item>
                                            } 
                                        />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item 
                                            name="paymentStatus" 
                                            label={t('orderPage.paymentStatus')}
                                        >
                                            <Segmented defaultValue="notPaid" options={[{ label: t('paid'), value: 'paid' }, { label: t('notPaid'), value: 'notPaid' }]} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item 
                                            name="comment" 
                                            label={t('orderPage.comment')}
                                        >
                                            <TextArea />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item 
                                            name="paymentDate" 
                                            label={t('orderPage.paymentDate')}
                                        >
                                            <DatePicker defaultValue={dayjs()} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                    <Form.Item label={null}>
                                        <Button type="primary" htmlType="submit">
                                            {t(`orderPage.button.${type}`)}
                                        </Button>
                                    </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                    <List
                                        dataSource={(order.orderPayments || [])}
                                        renderItem={(orderPayment) => (
                                            <List.Item actions={[<Button icon={<DeleteFilled />} onClick={() => removeOrderPayment(orderPayment._id)} />]}>
                                                <List.Item.Meta
                                                    title={`${orderPayment.amount} ${orderPayment.currency.symbol} | ${orderPayment.cashregister.names[selectedLanguage]}`}
                                                    description={`${orderPayment.cashregisterAccount.names[selectedLanguage]} | ${orderPayment.comment} | ${orderPayment.paymentStatus} | ${orderPayment.date}`}
                                                />
                                            </List.Item>
                                        )}
                                    />
                                    </Col>

                                </Row>
                            </Form>
                        </>
                    }
                
                </Col>
            </Row>

            {/* <ProductTable addProduct={addProduct} /> */}
            {/* <Form form={form} onFinish={actions[type]} layout='vertical'>
                <Col span={12}>
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
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
                        </Col>
                        <Col span={12}>
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
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
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
                        </Col>
                        <Col span={12}>
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
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Form.Item 
                                name="client" 
                                label={t('orderPage.clients')}
                            >
                                <Select
                                    optionFilterProp="label"
                                    showSearch
                                    onSearch={searchClient}
                                    dropdownStyle={{
                                        maxHeight: 400,
                                        overflow: 'auto',
                                    }}
                                    placeholder={t('orderPage.select.clients')}
                                    allowClear
                                    treeDefaultExpandAll={false}
                                    options={clients}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item 
                                name="comment" 
                                label={t('orderPage.comment')}
                            >
                                <TextArea />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]}>
                        <Col>
                            <Form.Item label={null}>
                                <Button type="primary" htmlType="submit">
                                    {t(`orderPage.button.${type}`)}
                                </Button>
                            </Form.Item>
                        </Col>
                    </Row>
                </Col>
            </Form>
            <Form form={clientForm} onFinish={async () => createClient()} layout='vertical'>
                <Form.Item 
                    name="name" 
                    label={t('orderPage.name')}
                >
                    <Input />
                </Form.Item>
                <Form.Item 
                    name="middlename" 
                    label={t('orderPage.middlename')}
                >
                    <Input />
                </Form.Item>
                <Form.Item 
                    name="lastname" 
                    label={t('orderPage.lastname')}
                >
                    <Input />
                </Form.Item>
                <Form.Item 
                    name="dayOfBirth" 
                    label={t('orderPage.dayOfBirth')}
                >
                    <DatePicker />
                </Form.Item>
                <Form.Item label={null}>
                    <Button type="primary" htmlType="submit">
                        {t(`orderPage.button.${type}`)}
                    </Button>
                </Form.Item>
            </Form>
            <Form form={paymentForm} onFinish={async () => createOrderPayment()} layout='vertical'>
                <Form.Item 
                    name="cashregister" 
                    label={t('orderPage.cashregister')}
                >
                    <Select
                        onChange={(v) => setSelectedCashregister(v)}
                        optionFilterProp="label"
                        options={(props.cashregisters || []).map(item => ({
                            value: item._id,
                            label: item.names[selectedLanguage]
                        }))}
                    />
                </Form.Item>
                <Form.Item 
                    name="cashregisterAccount" 
                    label={t('orderPage.cashregisterAccount')}
                >
                    <Select
                        onChange={(v) => setSelectedCashregisterAccount(v)}
                        optionFilterProp="label"
                        options={(cashregisterAccounts || []).map(item => ({
                            value: item._id,
                            label: item.names[selectedLanguage]
                        }))}
                    />
                </Form.Item>
                <Form.Item
                    name="amount"
                    label={t('orderPage.amount')}
                    style={{
                        display: 'inline-block',
                        width: 'calc(50% - 4px)',
                    }}
                >
                <InputNumber 
                    style={{width: '100%'}} 
                    addonAfter={
                    <Form.Item 
                        name="currency" 
                        noStyle
                        rules={[{ required: true, message: t(`orderPage.currency`) }]}
                    >
                        <Select
                            style={{width: 50}}
                            options={(props.currencies || []).map((currency, key) => ({
                                label: currency.symbol,
                                value: currency._id,
                                disabled: !allowedCurrencies.includes(currency._id),
                                key
                            }))}
                        />
                    </Form.Item>
                    } 
                />
                </Form.Item>
                <Form.Item 
                    name="paymentStatus" 
                    label={t('orderPage.paymentStatus')}
                >
                    <Segmented defaultValue="notPaid" options={[{ label: t('paid'), value: 'paid' }, { label: t('notPaid'), value: 'notPaid' }]} />
                </Form.Item>
                <Form.Item 
                    name="comment" 
                    label={t('orderPage.comment')}
                >
                    <TextArea />
                </Form.Item>
                <Form.Item 
                    name="paymentDate" 
                    label={t('orderPage.paymentDate')}
                >
                    <DatePicker defaultValue={dayjs()} />
                </Form.Item>
                <Form.Item label={null}>
                    <Button type="primary" htmlType="submit">
                        {t(`orderPage.button.${type}`)}
                    </Button>
                </Form.Item>
            </Form>
            <List
                dataSource={(order.orderPayments || [])}
                renderItem={(orderPayment) => (
                    <List.Item actions={[<Button icon={<DeleteFilled />} onClick={() => removeOrderPayment(orderPayment._id)} />]}>
                        <List.Item.Meta
                            title={`${orderPayment.amount} ${orderPayment.currency.symbol} | ${orderPayment.cashregister.names[selectedLanguage]}`}
                            description={`${orderPayment.cashregisterAccount.names[selectedLanguage]} | ${orderPayment.comment} | ${orderPayment.paymentStatus} | ${orderPayment.date}`}
                        />
                    </List.Item>
                )}
            />
            <SelectProductTable
                products={selectedProducts}
                removeProduct={removeProduct}
            /> */}
        </Content>
    );
}