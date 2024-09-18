import { Layout, Card, Avatar } from 'antd';
import { 
    UserOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import request from '../../../utils/requests';
import { useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next'; 
import { useState, useEffect } from 'react';

const { Content } = Layout;

export default function Page() {

    const [user, setUser] = useState([]);

    let { _id } = useParams();

    const { t } = useTranslation();
    
    const { tokens, profile } = useSelector((state) => state.auth);
    const params = { userId: profile._id, tokens }

    const getUser = async (value) => {
        const { status, data } = await request.getUser({ _id }, params);
        if (status === 'success') {
            setUser(data[0]);
        }
    }

    useEffect(() => {
        getUser(_id);
    }, []);

    return (<Content style={{ margin: '8px 16px', backgroundColor: 'white' }} >
        <Card>
            <Card.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={user.name}
                description={user.role}
            />
        </Card>
    </Content>);
}