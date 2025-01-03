import React, { useState, useEffect } from 'react';
import { Image, Space, Layout, Table, Tag, Button, InputNumber, Select, Modal, Form, Input, TreeSelect, Upload, Divider } from 'antd';
import { 
    PlusOutlined,
    DeleteFilled,
    EditFilled,
    UploadOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import placeholder from '../../images/placeholder.jpg';
import request from '../../../utils/requests';

import { DndContext, PointerSensor, useSensor } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const { Content } = Layout;

const DraggableUploadListItem = ({ originNode, file }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: file.uid,
    });
    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        cursor: 'move',
    };
    return (
        <div
            ref={setNodeRef}
            style={style}
            className={isDragging ? 'is-dragging' : ''}
            {...attributes}
            {...listeners}
        >
            {file.status === 'error' && isDragging ? originNode.props.children : originNode}
        </div>
    );
};

export default function Page({ props }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectCategories, setSelectCategories] = useState([]);
    const [selectedCustomFieldGroup, setSelectedCustomFieldGroup] = useState([]);
    const [selectedStock, setSelectedStock] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [uploadList, setUploadList] = useState([]);
    const [productsTableData, setProductsTableData] = useState({ pagination: null, sorter: null, filter: null, count: 0 });

    const [form] = Form.useForm();

    const { t } = useTranslation();

    const { tokens, profile } = useSelector((state) => state.auth);
    const { currencies, languages, selectedLanguage } = useSelector((state) => state.theme);
    const params = { userId: profile._id, tokens }

    const createProduct = async () => {
        const formValues = form.getFieldsValue();

        const { status } = await request.createProduct({ ...formValues, uploadList }, params);

        if (status === 'success') {
            getProducts();
            closeProductModal();
            setFileList([]);
            setUploadList([]);
        }
    }

    const editProduct = async () => {
        const formData = form.getFieldsValue();
        const { status } = await request.editProduct({ _id: editingProduct, ...formData, uploadList, fileList }, params);

        if (status === 'success') {
            getProducts();
            closeProductModal();
        }
    }

    const getProducts = async (value) => {
        const { status, data } = await request.getProducts(value, params);
        if (status === 'success') {
            setProducts(data.products);
            setProductsTableData({ count: data.productsCount });
        }
    }

    const getCategories = async () => {
        const { status, data } = await request.getCategories({}, params);
        if (status === 'success') {
            setCategories(data.categories);
            setSelectCategories(data.categories.map(mapCategory));
        }
    }

    const openProductModal = () => {
        setIsModalOpen(true);
    }

    const closeProductModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        setFileList([]);
        setUploadList([]);
        form.resetFields();
    }

    const removeProduct = async (_id) => {
        const { status } = await request.removeProduct({ _id }, params);
        if (status === 'success') getProducts(); // CAN BE REWRITED BUT HAVE PROBLEM WITH REMOVE CHILD
        // setCategories(state => state.filter(item => item._id !== _id));
    }

    const openEditProductModal = (_id) => {
        setIsModalOpen(!isModalOpen);
        setEditingProduct(_id);

        const product = products.find(item => item._id === _id);

        const productData = {
            ...product,
            currency: product.currency._id,
            unit: product.unit._id,
            wholesaleCurrency: product.wholesaleCurrency._id,
            categories: product.categories.map(item => item._id)
        }

        changeCustomFieldGroup(product.customFieldsGroup)

        const images = product.images.map((image, index) => ({
            uid: image._id,
            status: 'done',
            name: image.preview.name,
            thumbUrl: process.env.REACT_APP_BACK_URL + '/' + image.preview.path,
        }));

        setFileList(images);

        form.setFieldsValue(productData);
    }

    function mapCategory(category) {
        const children = Array.isArray(category.children) ? category.children : [];

        return {
            title: category.names[selectedLanguage],
            value: category._id,
            children: children.map(mapCategory)
        };
    }

    const sensor = useSensor(PointerSensor, {
        activationConstraint: {
            distance: 10,
        },
    });

    const onDragEnd = ({ active, over }) => {
        if (!over) return;
    
        if (active.id !== over.id) {
            setUploadList((prev) => {
                const activeIndex = prev.findIndex((i) => i?.uid === active.id);
                const overIndex = prev.findIndex((i) => i?.uid === over.id);
                return arrayMove(prev, activeIndex, overIndex);
            });
    
            setFileList((prev) => {
                const activeIndex = prev.findIndex((i) => i?.uid === active.id);
                const overIndex = prev.findIndex((i) => i?.uid === over.id);
                return arrayMove(prev, activeIndex, overIndex);
            });
        }
    };
    

    const onChangeUpload = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const handleUpload = ({ file, onSuccess }) => {
        setTimeout(() => {
            setUploadList([...uploadList, file])
            onSuccess("ok");
        }, 0)
    };

    const productsTableChange = (pagination, filters, sorter) => {
        console.log({ pagination, filters, sorter })
        setSelectedStock(filters.quantity);
        getProducts({ pagination, filters, sorter });
        setProductsTableData(state => ({ pagination, filters, sorter, ...state }))
    }

    const changeCustomFieldGroup = (v) => {
        const customFieldGroup = props.customFieldGroups.find(item => item._id === v);
        if (!customFieldGroup) return;
        const customFields = props.attributes
        setSelectedCustomFieldGroup(customFields.filter(item => (customFieldGroup.customFields || []).includes(item._id)));
    }

    useEffect(() => {
        getProducts({});
        getCategories();
    }, [])

    const columns = [
        { 
            title: t('productsPage.image'), 
            key: 'newImages',
            width: 80,
            render: (text, { images }) => <div className="productImages">
                <Image.PreviewGroup
                    items={
                        images && images.length > 0 ? 
                        images.map((image) => (process.env.REACT_APP_BACK_URL + '/' + image.main.path)) : 
                        [placeholder]
                    }
                >
                    <Image 
                        className="productImage"
                        width={70} 
                        src={images && images.length > 0 ? process.env.REACT_APP_BACK_URL + '/' + images[0].preview.path : placeholder} 
                    />
                </Image.PreviewGroup>
            </div>
        }, 
        {
            title: t('productsPage.names'),
            dataIndex: 'names',
            render: (text) => text[selectedLanguage] 
        },
        {
            title: t('productsPage.price'),
            dataIndex: 'price',
            render: (text, { currency }) => `${text} ${currency.symbol}`
        },
        {
            title: t('productsPage.wholesalePrice'),
            dataIndex: 'wholesalePrice',
            render: (text, { wholesaleCurrency }) => `${text} ${wholesaleCurrency.symbol}`
        },
        {
            title: t('productsPage.quantity'),
            dataIndex: 'quantity',
            filters: (props.stocks || []).map(item => ({
                text: item.names[selectedLanguage],
                value: item._id
            })),
            filteredValue: selectedStock || null,
            filtred: selectedStock !== null,
            defaultFilteredValue: (props?.stocks?.[0]?._id || null),
            filterMultiple: false,
            render: (quantity, { unit }) => `${(quantity?.amount || 0)} ${(unit?.symbol || '')}`
        },
        {
            title: t('productsPage.categories'),
            dataIndex: 'categories',
            render: (categories) => (<>
                { (categories || []).map((tag, key) => 
                    <Tag key={key}>
                        {tag.names[selectedLanguage]}
                    </Tag>
                ) }
            </>),
        },
        {
            title: t('productsPage.updated'),
            dataIndex: 'updatedAt',
        },
        {
            title: t('productsPage.created'),
            dataIndex: 'createdAt',
        },
        {
            width: 40,
            key: 'key',
            render: (_, { _id }) => 
            <Space>
                <Button icon={<EditFilled />} onClick={() => openEditProductModal(_id)} />
                <Button icon={<DeleteFilled />} onClick={() => removeProduct(_id)} />
            </Space>
        },
    ];

    return (<>
        <Content style={{ margin: '8px 16px', backgroundColor: 'white' }} >
            <Space.Compact style={{ padding: 8, float: 'right' }}>
                <Button icon={<PlusOutlined />} type="primary" onClick={() => openProductModal()}/>
            </Space.Compact>
            <Table 
                columns={columns} 
                dataSource={products}
                onChange={productsTableChange}
                pagination={{ total: productsTableData.count }}
                rowKey={(record) => record._id}
            />
        </Content>

        <Modal
            title={editingProduct ? t('productsPage.editProductTitle') : t('productsPage.createProductTitle')}
            open={isModalOpen}
            confirmLoading={false}
            onCancel={() => closeProductModal()}
            footer={[
                <Button
                  type="primary"
                  loading={false}
                  icon={<PlusOutlined />}
                  onClick={() => form.submit()}
                  key="create"
                >
                  { editingProduct ? t('productsPage.editProductButton') : t('productsPage.createProductButton') }
                </Button>,
            ]}
        >
            <Form form={form} layout='vertical' onFinish={() => editingProduct ? editProduct() : createProduct()}>
                {
                    languages.all.map((item, key) => 
                    <Form.Item
                        key={key}
                        label={`name${item.code}`}
                        name={['names', item.code]}   
                        rules={[{ required: item.main, message: t(`productsPage.requiredProductName`) }]}
                    >
                        <Input />
                    </Form.Item>
                    )
                }
                <Form.Item
                    style={{
                        marginBottom: 0,
                    }}
                >
                    <Form.Item
                        name="price"
                        label={t('productsPage.productPrice')}
                        rules={[{ required: true, message: t(`productsPage.requiredProductPrice`) }]}
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
                            rules={[{ required: true, message: t(`productsPage.requiredProductCurrency`) }]}
                        >
                            <Select
                                style={{width: 50}}
                                options={(currencies.all || []).map((currency, key) => ({
                                    label: currency.symbol,
                                    value: currency._id,
                                    key
                                }))}
                            />
                        </Form.Item>
                        } />
                    </Form.Item>
                    <Form.Item
                        name="wholesalePrice"
                        label={t('productsPage.wholesalePrice')}
                        style={{
                            display: 'inline-block',
                            width: 'calc(50% - 4px)',
                            margin: '0 0 0 8px',
                        }}
                    >
                    <InputNumber 
                        style={{width: '100%'}} 
                        addonAfter={
                        <Form.Item name="wholesaleCurrency" noStyle>
                            <Select
                            style={{width: 50}}
                            options={(currencies.all || []).map((currency, key) => ({
                                label: currency.symbol,
                                value: currency._id,
                                key
                            }))}
                            />
                        </Form.Item>
                        } />
                    </Form.Item>
                </Form.Item>
                <Form.Item 
                    name="categories" 
                    // rules={[{ required: true, message: t(`requiredProductCategories`) }]}
                    label={t('productsPage.categories')}
                >
                    <TreeSelect
                        // showSearch
                        multiple={true}
                        // onSearch={handleSearch}
                        dropdownStyle={{
                            maxHeight: 400,
                            overflow: 'auto',
                        }}
                        placeholder={t('productsPage.select.category')}
                        allowClear
                        treeDefaultExpandAll={false}
                        treeData={selectCategories}  
                    />
                </Form.Item>
                <Form.Item label={t('productsPage.uploadFileTitle')}>
                    <DndContext sensors={[sensor]} onDragEnd={onDragEnd}>
                        <SortableContext items={fileList.map((i) => i.uid)} strategy={verticalListSortingStrategy}>
                            <Upload
                                onChange={onChangeUpload}
                                fileList={fileList}
                                listType="picture"
                                customRequest={handleUpload}
                                itemRender={(originNode, file) => (<DraggableUploadListItem originNode={originNode} file={file} />)}
                            >
                                <Button icon={<UploadOutlined />}>{t('productsPage.uploadFile')}</Button>
                            </Upload>
                        </SortableContext>
                    </DndContext>
                </Form.Item>
                <Form.Item
                    label={t('productsPage.unit')}
                    name={'unit'}
                    rules={[{ required: true, message: t(`productsPage.requiredUnit`) }]}
                >
                    <Select
                        // onChange={(v) => changeCustomFieldGroup(v)}
                        options={props.units.map(item => ({ 
                            value: item._id,
                            label: item.names[selectedLanguage]
                        }))}
                    />
                </Form.Item>
                <Divider orientation="left">{ t('productsPage.dividerAttributes') }</Divider>
                <Form.Item
                    label={t('productsPage.customFieldGroups')}
                    name={'customFieldsGroup'}
                    rules={[{ required: true, message: t(`productsPage.requiredCustomFieldGroup`) }]}
                >
                    <Select
                        onChange={(v) => changeCustomFieldGroup(v)}
                        options={props.customFieldGroups.map(item => ({ 
                            value: item._id,
                            label: item.names[selectedLanguage]
                        }))}
                    />
                </Form.Item>
                {
                    (selectedCustomFieldGroup || []).map((item, key) => 
                        <Form.Item
                            key={key}
                            label={item.names[selectedLanguage]}
                            name={['customFields', item._id]}
                            rules={[{ required: item.main, message: t(`productsPage.requiredAttribute`) }]}
                        >
                            { 
                                item.type === 'text' ? 
                                <Input /> :
                                <Select
                                    mode={item.is_multiple ? 'multiple' : 'default'} 
                                    options={item.options.map(item => ({ 
                                        value: item._id,
                                        label: item.names[selectedLanguage]
                                    }))}
                                /> 
                            }
                        </Form.Item>
                    ) 
                }
            </Form>

        </Modal>
    </>);
}