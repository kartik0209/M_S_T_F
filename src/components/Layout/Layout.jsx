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
  BarChartOutlined,
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
      onClick: () => navigate('/profile')
    },

    { type: 'divider' },
    {
      key: '3',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: logout
    }
  ];

  // Regular user menu items
  const userSidebarItems = [
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
    },
    { type: 'divider' },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: 'Profile'
    }
  ];

  // Admin-only menu items
  const adminSidebarItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'Admin Dashboard'
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: 'User Management'
    },
    {
      key: '/admin/todos',
      icon: <UnorderedListOutlined />,
      label: 'All Todos'
    },
    {
      key: '/admin/reports',
      icon: <BarChartOutlined />,
      label: 'Analytics & Reports'
    },
    { type: 'divider' },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: 'Profile'
    }
  ];

  // Determine which menu items to show based on user role
  const menuItems = user?.role === 'admin' ? adminSidebarItems : userSidebarItems;

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
          {user?.role === 'admin' && !collapsed && (
            <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
              Admin Panel
            </div>
          )}
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
            {user?.role === 'admin' && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Administrator Mode
              </Text>
            )}
          </Space>
          
          <Space className="header-right">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space className="user-info">
                <Avatar 
                  src={user?.profileImage} 
                  icon={<UserOutlined />} 
                  size="small"
                />
                <div>
                  <Text>{user?.username}</Text>
                  {user?.role === 'admin' && (
                    <div style={{ fontSize: '10px', color: '#666' }}>Admin</div>
                  )}
                </div>
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