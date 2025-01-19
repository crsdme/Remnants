import React, { useEffect, useState } from 'react';
import { Table, Image, Button, Space, Tag } from 'antd';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import request from '../../../utils/requests';
import placeholder from '../../images/placeholder.jpg';
import { 
    EditFilled,
    DeleteFilled,
    PlusOutlined,
    CloseOutlined,
    UnorderedListOutlined
} from '@ant-design/icons';

export default function SelectProductTable({ products, removeProduct }) {
    const { t } = useTranslation();

    const { tokens, profile } = useSelector((state) => state.auth);
    const { languages, selectedLanguage } = useSelector((state) => state.theme);
    const params = { userId: profile._id, tokens }

    const columns = [
        { 
            title: t('productsTable.image'), 
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
            title: t('productsTable.names'),
            dataIndex: 'names',
            render: (text) => text[selectedLanguage] 
        },
        {
            title: t('productsTable.price'),
            dataIndex: 'price',
            render: (text, { currency }) => `${text} ${currency.symbol}`
        },
        {
            title: t('productsTable.price'),
            dataIndex: 'price',
            render: (text, { quantity }) => `${quantity}`
        },
        {
            title: t('productsTable.categories'),
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
            width: 40,
            key: 'key',
            render: (_, { _id }) => 
            <Space>
                <Button type="primary" danger icon={<DeleteFilled />} onClick={() => removeProduct(_id)} />
            </Space>
        },
    ];

    return (
        <Table
            scroll={{ y: 300, x: 'auto' }}
            columns={columns} 
            dataSource={products}
        />
    );
}