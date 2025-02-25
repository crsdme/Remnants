import { Layout } from 'antd';
const { Header, Content, Sider } = Layout;
import { Sidemenu } from '../Sidemenu';
import { Outlet } from 'react-router';

const App: React.FC = () => {
  return (
    <Layout>
      <Sider>
        <Sidemenu />
      </Sider>
      <Layout>
        <Header />
        <Content style={{ padding: 10, height: 'calc(100vh - 64px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
