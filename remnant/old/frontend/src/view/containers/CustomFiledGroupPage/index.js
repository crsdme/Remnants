import React, { useEffect, useState } from 'react';
import { Space, Layout, Table, Button, Col, Row, Form, Input, Typography, InputNumber, Flex, Modal, Select } from 'antd';
import { 
    EditFilled,
    DeleteFilled,
    PlusOutlined,
    PropertySafetyFilled,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import request from '../../../utils/requests';

const { Content } = Layout;
const { Title } = Typography;

export default function Page({ props }) {
    const { t } = useTranslation();
    const [form] = Form.useForm();

    const [editingGroup, setEditingGroup] = useState(null);
    // const [attributeOptionId, setAttributeOptionId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [groups, setGroups] = useState([]);

    const { tokens, profile } = useSelector((state) => state.auth);
    const { languages, selectedLanguage } = useSelector((state) => state.theme);
    const params = { userId: profile._id, tokens }

    const createGroup = async () => {
        const { names, priority, customFields } = form.getFieldsValue();
        const { status, data } = await request.createCustomFieldGroup({ names, priority, customFields }, params);
        if (status === 'success') {
            setGroups(state => [data, ...state]);
            closeModal();
        }
    }

    const editGroup = async () => {
        const { names, priority, customFields } = form.getFieldsValue();
        const { status } = await request.editCustomFieldGroup({ _id: editingGroup, names, priority, customFields }, params);
        if (status === 'success') {
            getGroups();
            closeModal();
        }
    }

    const removeGroup = async (_id) => {
        const { status } = await request.removeCustomFieldGroup({ _id }, params);
        if (status === 'success') getGroups(); // CAN BE REWRITED BUT HAVE PROBLEM WITH REMOVE CHILD
        // setAttributes(state => state.filter(item => item._id !== _id));
    }

    const getGroups = async () => {
        const { status, data } = await request.getCustomFieldGroups({}, params);
        if (status === 'success') {
            setGroups(data.customFieldsGroups);
        }
    }


    const openCreateModal = () => {
        setIsModalOpen(true);
    }

    const openEditModal = (_id) => {
        setIsModalOpen(!isModalOpen);
        setEditingGroup(_id);
        const group = groups.find(item => item._id === _id);
        form.setFieldsValue(group);
    }

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingGroup(null);
        form.resetFields();
    }

    useEffect(() => {
        getGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const columns = [
        {
            title: t('customFieldGroupPage.name'),
            dataIndex: ['names', selectedLanguage],
            key: 'key'
        },
        {
            title: t('customFieldGroupPage.priority'),
            dataIndex: 'priority',
            key: 'key'
        },
        {
            width: 40,
            key: 'key',
            render: (_, { _id }) => <Space>
                <Button icon={<EditFilled />} onClick={() => openEditModal(_id)} />
                <Button icon={<DeleteFilled />} onClick={() => removeGroup(_id)} />
            </Space>
        },
    ];

    return (
        <Content style={{ margin: 20 }}>
            <Row style={{ height: 50 }}>
                <Col span={4}>
                    <Flex justify='start' align='center' style={{ height: '100%' }}>
                        <Title style={{ margin: 0 }} level={4}>{t('customFieldGroupPage.title')}</Title>
                    </Flex>
                </Col>
                <Col span={17}>
                </Col>
                <Col span={3}>
                    <Flex justify='start' align='center' style={{ height: '100%' }}>
                        <Button block icon={<PlusOutlined />} onClick={() => openCreateModal()} >{t('customFieldGroupPage.create')}</Button>
                    </Flex>
                </Col>
            </Row>
            <Table 
                columns={columns}
                dataSource={groups}
            />

            <Modal 
                title={true ? t('customFieldGroupPage.edit.title') : t('customFieldGroupPage.create.title')}
                open={isModalOpen} 
                width={400}
                centered
                onOk={() => form.submit()}
                onCancel={() => closeModal()}
            >
                <Form form={form} onFinish={async () => editingGroup ? await editGroup() : await createGroup()} layout='vertical'>
                    { languages.all.map((language, key) => 
                        <Form.Item 
                            name={['names', language.code]} 
                            label={t(`customFieldGroupPage.name.${language.code}`)}
                            rules={[{ required: language.main }]}
                            key={key}
                        >
                            <Input />
                        </Form.Item>
                    ) }
                    <Form.Item 
                        name="priority" 
                        label={t('customFieldGroupPage.priority')}
                    >
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item 
                        name="customFields" 
                        label={t('customFieldGroupPage.customFields')}
                    >
                        <Select
                            mode="multiple"
                            options={(props.customFields || []).map(item => ({
                                value: item._id,
                                label: item.names[selectedLanguage]
                            }))}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </Content>
    );
}