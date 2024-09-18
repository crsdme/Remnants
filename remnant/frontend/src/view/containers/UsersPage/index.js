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

    const [languages, setLanguages] = useState([]);

    const [openLanguageModal, setOpenLanguageModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [tablePagination, setTablePagination] = useState([]);
    const [editingLanguage, setEditingLanguage] = useState(null);
    const [tableFilters, setTableFilters] = useState({ pagination: { current: 1, pageSize: 10 } });

    const [form] = Form.useForm();

    const { t } = useTranslation();

    const initialValues = {
        name: null,
        code: null,
        main: null,
        active: null,
    }

    const { tokens, profile } = useSelector((state) => state.auth);
    const params = { userId: profile._id, tokens }

    const createLanguage = async (value) => {
        const { status } = await request.createLanguage(value, params);
        if (status === 'success') {
            getLanguages(tableFilters);
            form.setFieldsValue(initialValues);
            setOpenLanguageModal(false);
            setEditingLanguage(null);
        }
    }

    const editLanguage = async (value) => {
        const { status } = await request.editLanguage({...value, _id: editingLanguage._id}, params);
        if (status === 'success') {
            getLanguages(tableFilters);
            form.setFieldsValue(initialValues);
            setOpenLanguageModal(false);
            setEditingLanguage(null);
        }
    }

    const removeLanguage = async (_id) => {
        const { status } = await request.removeLanguage({ _id }, params);
        if (status === 'success') getLanguages(tableFilters);
    }

    const getLanguages = async (filters) => {
        const { status, data } = await request.getLanguages(filters, params);
        if (status === 'success') {
            setLoading(false)
            setLanguages(data.languages);
            setTablePagination(data.languagesCount);
        }
    }

    const startEditLanguage = async (_id) => {
        const language = languages.find(item => item._id === _id);
        const languageValues = {
            name: language.name,
            code: language.code,
            main: language.main,
            active: language.active,
        }
        form.setFieldsValue(languageValues);
        setOpenLanguageModal(true);
        setEditingLanguage(language);
    }

    const startCreateLanguage = async () => {
        form.setFieldsValue(initialValues);
        setOpenLanguageModal(true);
        setEditingLanguage(null);
    }

    const onChangeTable = (pagination, filters, sorter) => {
        setTableFilters({ pagination, filters, sorter });
        getLanguages({ pagination, filters, sorter })
    }

    useEffect(() => {
        getLanguages(tableFilters);
        
        const updateLanguagesHandler = (updatedData) => {
            if (updatedData.status) {
                getLanguages(tableFilters);
            }
        }

        const data = socket.on('/updateLanguages', updateLanguagesHandler);
        console.log(data)
        return () => {
            socket.off('/updateLanguages', updateLanguagesHandler);
            socket.disconnect();
        };
    }, []);

    const columns = [
        {
            title: t('name'),
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: t('code'),
            dataIndex: 'code',
            key: 'code',
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
                <Button type='primary' icon={<EditOutlined />} onClick={() => startEditLanguage(_id)} />
                <Popconfirm
                    title="Delete the task"
                    description="Are you sure to delete this task?"
                    onConfirm={() => removeLanguage(_id)}
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
                <Button icon={<PlusOutlined />} type="primary" onClick={() => startCreateLanguage()}/>
            </Space.Compact>
            <Table 
                columns={loading ? loadingColumns : columns} 
                dataSource={loading ? loadingData : languages}
                pagination={{ total: tablePagination }}
                onChange={(pagination, filters, sorter) => onChangeTable(pagination, filters, sorter)}
                style={{ padding: '0 8px' }}
            />
        </Content>

        <Modal
            title={editingLanguage ? t('editLanguage') : t('createLanguage')}
            open={openLanguageModal}
            confirmLoading={false}
            onCancel={() => setOpenLanguageModal(false)}
            footer={[
                <Button
                  type="primary"
                  loading={false}
                  icon={editingLanguage ? <EditOutlined /> : <PlusOutlined />}
                  onClick={() => form.submit()}
                >
                  { editingLanguage ? t('editLanguage') : t('createLanguage') }
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical" onFinish={(v) => editingLanguage ? editLanguage(v) : createLanguage(v)}>
                <Form.Item
                    label={t('languageName')}
                    name="name"
                    rules={[{ required: true, message: t('requiredLanguageName') }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label={t('languageCode')}
                    name="code"
                    rules={[{ required: true, message: t('requiredLanguageCode') }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label={t('languageMain')}
                    name="main"
                    valuePropName="checked"
                >
                    <Checkbox />
                </Form.Item>
                <Form.Item
                    label={t('languageActive')}
                    name="active"
                    valuePropName="checked"
                >
                    <Checkbox />
                </Form.Item>
            </Form>
        </Modal>
    </>);
}