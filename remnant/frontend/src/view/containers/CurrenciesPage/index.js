import React, { useState, useEffect } from 'react';
import { Space, Layout, Table, Button, Modal, Form, Input, Checkbox, Popconfirm, Skeleton } from 'antd';
import { 
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import request from '../../../utils/requests';
import socket from '../../../utils/socket';

const { Content } = Layout;

export default function Page() {

    const [currencies, setCurrencies] = useState([]);

    const [openCurrencyModal, setOpenCurrencyModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [tablePagination, setTablePagination] = useState([]);
    const [editingCurrency, setEditingCurrency] = useState(null);
    const [tableFilters, setTableFilters] = useState({ pagination: { current: 1, pageSize: 10 } });

    const [form] = Form.useForm();

    const { t } = useTranslation();
    const { languages, selectedLanguage } = useSelector((state) => state.theme);

    const initialValues = {
        name: null,
        code: null,
        symbol: null,
        active: null,
        main: null,
    }

    const { tokens, profile } = useSelector((state) => state.auth);
    const params = { userId: profile._id, tokens }

    const createCurrency = async (value) => {
        const { status } = await request.createCurrency(value, params, t);
        if (status === 'success') {
            getCurrencies(tableFilters);
            form.setFieldsValue(initialValues);
            setOpenCurrencyModal(false);
            setEditingCurrency(null);
        }
    }

    const editCurrency = async (value) => {
        const { status } = await request.editCurrency({...value, _id: editingCurrency._id}, params, t);
        if (status === 'success') {
            getCurrencies(tableFilters);
            form.setFieldsValue(initialValues);
            setOpenCurrencyModal(false);
            setEditingCurrency(null);
        }
    }

    const removeCurrency = async (_id) => {
        const { status } = await request.removeCurrency({ _id }, params, t);
        if (status === 'success') getCurrencies(tableFilters);
    }

    const getCurrencies = async (filters) => {
        const { data } = await request.getCurrencies(filters, params, t);
        setLoading(false)
        setCurrencies(data.currencies);
        setTablePagination(data.currencies);
    }

    const startEditCurrency = async (_id) => {
        const currency = currencies.find(item => item._id === _id);
        form.setFieldsValue(currency);
        setOpenCurrencyModal(true);
        setEditingCurrency(currency);
    }

    const startCreateCurrency = async () => {
        form.setFieldsValue(initialValues);
        setOpenCurrencyModal(true);
        setEditingCurrency(null);
    }

    const onChangeTable = (pagination, filters, sorter) => {
        setTableFilters({ pagination, filters, sorter });
        getCurrencies({ pagination, filters, sorter })
    }

    useEffect(() => {
        getCurrencies(tableFilters);
    }, []);

    const columns = [
        {
            title: t('names'),
            dataIndex: 'names',
            key: 'names',
            render: (names) => names[selectedLanguage] 
        },
        {
            title: t('symbol'),
            dataIndex: 'symbol',
            key: 'symbol',
        },
        {
            title: t('code'),
            dataIndex: 'code',
            key: 'code',
        },
        {
            title: t('exchangeRate'),
            dataIndex: 'exchangeRate',
            key: 'exchangeRate',
        },
        {
            title: t('active'),
            dataIndex: 'active',
            key: 'active',
            render: (active) => <>{active ? 'true' : 'false'}</>
        },
        {
            title: t('main'),
            dataIndex: 'main',
            key: 'main',
            render: (main) => <>{main ? 'true' : 'false'}</>
        },
        {
            dataIndex: '_id',
            width: 30,
            render: (_id) => <Space.Compact direction="vertical">
                <Button type='primary' icon={<EditOutlined />} onClick={() => startEditCurrency(_id)} />
                <Popconfirm
                    title="Delete the task"
                    description="Are you sure to delete this task?"
                    onConfirm={() => removeCurrency(_id)}
                >
                    <Button type='primary' danger icon={<DeleteOutlined />} />
                </Popconfirm>
            </Space.Compact>
        }
    ];

    const loadingColumns = [
        {
            title: t('name'),
            render: () => <Skeleton loading={loading} active={loading} paragraph={{rows: 1}} />
        },
        {
            title: t('code'),
            render: () => <Skeleton loading={loading} active={loading} paragraph={{rows: 1}} />
        },
        {
            title: t('active'),
            render: () => <Skeleton loading={loading} active={loading} paragraph={{rows: 1}} />
        },
        {
            title: t('main'),
            render: () => <Skeleton loading={loading} active={loading} paragraph={{rows: 1}} />
        },
        {
            title: '',
            render: () => <Skeleton loading={loading} active={loading} paragraph={{rows: 1}} />
        }
    ];

    const loadingData = ['', '', '', '', '', '', '', '', '', '' ];

    return (<>
        <Content style={{ margin: '8px 16px', backgroundColor: 'white' }} >
            <Space.Compact style={{ float: 'right', padding: 8 }}>
                <Button icon={<PlusOutlined />} type="primary" onClick={() => startCreateCurrency()}/>
            </Space.Compact>
            <Table 
                columns={loading ? loadingColumns : columns} 
                dataSource={loading ? loadingData : currencies}
                pagination={{ total: tablePagination }}
                onChange={(pagination, filters, sorter) => onChangeTable(pagination, filters, sorter)}
                style={{ padding: '0 8px' }}
            />
        </Content>

        <Modal
            title={editingCurrency ? t('editCurrency') : t('createCurrency')}
            open={openCurrencyModal}
            confirmLoading={false}
            onCancel={() => setOpenCurrencyModal(false)}
            footer={[
                <Button
                  type="primary"
                  loading={false}
                  icon={editingCurrency ? <EditOutlined /> : <PlusOutlined />}
                  onClick={() => form.submit()}
                >
                  { editingCurrency ? t('editCurrency') : t('createCurrency') }
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical" onFinish={(v) => editingCurrency ? editCurrency(v) : createCurrency(v)}>
                { languages.all.map((language, key) => 
                    <Form.Item 
                        name={['names', language.code]} 
                        label={t(`currenciesPage.name.${language.code}`)}
                        rules={[{ required: language.main }]}
                        key={key}
                    >
                        <Input />
                    </Form.Item>
                ) }
                <Form.Item
                    label={t('currencyCode')}
                    name="code"
                    rules={[{ required: true, message: t('requiredCurrencyCode') }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label={t('currencyExchangeRate')}
                    name="exchangeRate"
                    rules={[{ required: true, message: t('requiredCurrencyExchangeRate') }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label={t('currencySymbol')}
                    name="symbol"
                    rules={[{ required: true, message: t('requiredCurrencySymbol') }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label={t('currencyMain')}
                    name="main"
                    valuePropName="checked"
                >
                    <Checkbox />
                </Form.Item>
                <Form.Item
                    label={t('currencyActive')}
                    name="active"
                    valuePropName="checked"
                >
                    <Checkbox />
                </Form.Item>
            </Form>
        </Modal>
    </>);
}