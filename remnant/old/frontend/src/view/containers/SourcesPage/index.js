import React, { useEffect, useState } from 'react';
import { Space, Layout, Table, Button, Col, Row, Form, Input, Typography, InputNumber, Flex, Modal, Checkbox } from 'antd';
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

    const [editingSource, setEditingSource] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sources, setSources] = useState([]);

    const { tokens, profile } = useSelector((state) => state.auth);
    const { languages, selectedLanguage } = useSelector((state) => state.theme);
    const params = { userId: profile._id, tokens }

    const createSource = async () => {
        const { names, priority } = form.getFieldsValue();
        const { status, data } = await request.createSource({ names, priority }, params);
        if (status === 'success') {
            setSources(state => [data, ...state]);
            closeModal();
        }
    }

    const editSource = async () => {
        const { names, priority } = form.getFieldsValue();
        const { status } = await request.editSource({ _id: editingSource, names, priority }, params);
        if (status === 'success') {
            getSources();
            closeModal();
        }
    }

    const removeSource = async (_id) => {
        const { status } = await request.removeSource({ _id }, params);
        if (status === 'success') getSources(); // CAN BE REWRITED BUT HAVE PROBLEM WITH REMOVE CHILD
        // setAttributes(state => state.filter(item => item._id !== _id));
    }

    const getSources = async () => {
        const { status, data } = await request.getSources({}, params);
        if (status === 'success') {
            setSources(data.sources);
        }
    }


    const openCreateModal = () => {
        setIsModalOpen(true);
    }

    const openEditModal = (_id) => {
        setIsModalOpen(!isModalOpen);
        setEditingSource(_id);
        const sourse = sources.find(item => item._id === _id);
        form.setFieldsValue(sourse);
    }

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSource(null);
        form.resetFields();
    }

    useEffect(() => {
        getSources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const columns = [
        {
            title: t('sourcesPage.name'),
            dataIndex: ['names', selectedLanguage],
            key: 'key'
        },
        {
            title: t('sourcesPage.priority'),
            dataIndex: 'priority',
            key: 'key'
        },
        {
            width: 40,
            key: 'key',
            render: (_, { _id }) => <Space>
                <Button icon={<EditFilled />} onClick={() => openEditModal(_id)} />
                <Button icon={<DeleteFilled />} onClick={() => removeSource(_id)} />
            </Space>
        },
    ];

    return (
        <Content style={{ margin: 20 }}>
            <Row style={{ height: 50 }}>
                <Col span={4}>
                    <Flex justify='start' align='center' style={{ height: '100%' }}>
                        <Title style={{ margin: 0 }} level={4}>{t('sourcesPage.title')}</Title>
                    </Flex>
                </Col>
                <Col span={17}>
                </Col>
                <Col span={3}>
                    <Flex justify='start' align='center' style={{ height: '100%' }}>
                        <Button block icon={<PlusOutlined />} onClick={() => openCreateModal()} >{t('sourcesPage.create')}</Button>
                    </Flex>
                </Col>
            </Row>
            <Table 
                columns={columns}
                dataSource={sources}
            />

            <Modal 
                title={true ? t('sourcesPage.edit.title') : t('sourcesPage.create.title')}
                open={isModalOpen} 
                width={400}
                centered
                onOk={() => form.submit()}
                onCancel={() => closeModal()}
            >
                <Form form={form} onFinish={async () => editingSource ? await editSource() : await createSource()} layout='vertical'>
                    { languages.all.map((language, key) => 
                        <Form.Item 
                            name={['names', language.code]} 
                            label={t(`sourcesPage.name.${language.code}`)}
                            rules={[{ required: language.main }]}
                            key={key}
                        >
                            <Input />
                        </Form.Item>
                    ) }
                    <Form.Item 
                        name="priority" 
                        label={t('sourcesPage.priority')}
                    >
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </Content>
    );
}