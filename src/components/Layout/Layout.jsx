import React, { useState } from 'react';
import { Layout as AntLayout, Menu, Avatar, Dropdown, Button, Space, Typography } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DashboardOutlined,
  UnorderedListOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,

} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Layout.scss';

const { Header, Sider, Content } = AntLayout;
const { Text } = Typography;

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userMenuItems = [
    {
      key: '1',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => console.log('Profile clicked')
    },
    {
      key: '2',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => console.log('Settings clicked')
    },
    { type: 'divider' },
    {
      key: '3',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: logout
    }
  ];

  const sidebarItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard'
    },
    {
      key: '/todos',
      icon: <UnorderedListOutlined />,
      label: 'All Todos'
    },
    {
      key: '/today',
      icon: <CalendarOutlined />,
      label: 'Today'
    },
    {
      key: '/completed',
      icon: <CheckCircleOutlined />,
      label: 'Completed'
    },
    {
      key: '/overdue',
      icon: <ExclamationCircleOutlined />,
      label: 'Overdue'
    }
  ];

  const adminItems = [
    { type: 'divider' },
    {
      key: 'admin-section',
      type: 'group',
      label: 'Admin Panel'
    },
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'Admin Dashboard'
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: 'Users'
    },
    {
      key: '/admin/todos',
      icon: <UnorderedListOutlined />,
      label: 'All Todos'
    },
    {
      key: '/admin/reports',
      icon: <DashboardOutlined />,
      label: 'Reports'
    }
  ];

  const menuItems = user?.role === 'admin' 
    ? [...sidebarItems, ...adminItems] 
    : sidebarItems;

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <AntLayout className="layout">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        theme="light"
        className="layout-sider"
      >
        <div className="logo">
          <Text strong>{collapsed ? 'T' : 'TodoApp'}</Text>
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      
      <AntLayout>
        <Header className="layout-header">
          <Space className="header-left">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
          </Space>
          
          <Space className="header-right">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space className="user-info">
                <Avatar 
                  src={user?.profileImage} 
                  icon={<UserOutlined />} 
                  size="small"
                />
                <Text>{user?.username}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        
        <Content className="layout-content">
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;