import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Avatar,
  message,
  Pagination,
  Modal,
  Form,
  Typography,
  Statistic,
  Row,
  Col,
  Spin
} from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  EditOutlined,
  EyeOutlined,
  FilterOutlined
} from '@ant-design/icons';
import apiService from '../../services/api';

const { Title } = Typography;
const { Option } = Select;

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    pageSize: 20
  });
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    isActive: ''
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, [pagination.current, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const response = await apiService.getAdminUsers(params);

      if (response.success) {
        setUsers(response.data.users);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total
        }));
      }
    } catch (error) {
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handlePageChange = (page, pageSize) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }));
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    form.setFieldsValue({
      role: user.role,
      isActive: user.isActive
    });
    setEditModalOpen(true);
  };

  const handleUpdate = async (values) => {
    try {
      setActionLoading(true);
      const response = await apiService.updateUser(selectedUser._id, values);
      
      if (response.success) {
        message.success('User updated successfully');
        setEditModalOpen(false);
        setSelectedUser(null);
        form.resetFields();
        fetchUsers();
      }
    } catch (error) {
      message.error('Failed to update user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = async (user) => {
    // In a real app, you might navigate to a detailed view
    // For now, we'll show a simple modal with user stats
    try {
      const response = await apiService.getUserDetails(user._id);
      if (response.success) {
        const { stats } = response.data;
        Modal.info({
          title: `${user.username} - User Details`,
          width: 600,
          content: (
            <div>
              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={6}>
                  <Statistic title="Total Todos" value={stats.total} />
                </Col>
                <Col span={6}>
                  <Statistic title="Completed" value={stats.completed} />
                </Col>
                <Col span={6}>
                  <Statistic title="Pending" value={stats.pending} />
                </Col>
                <Col span={6}>
                  <Statistic title="Overdue" value={stats.overdue} />
                </Col>
              </Row>
              <div style={{ marginTop: 16 }}>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> <Tag color={user.role === 'admin' ? 'red' : 'blue'}>{user.role}</Tag></p>
                <p><strong>Status:</strong> <Tag color={user.isActive ? 'green' : 'red'}>{user.isActive ? 'Active' : 'Inactive'}</Tag></p>
                <p><strong>Last Login:</strong> {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</p>
                <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          )
        });
      }
    } catch (error) {
      message.error('Failed to fetch user details');
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      role: '',
      isActive: ''
    });
  };

  const columns = [
    {
      title: 'User',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <Space>
          <Avatar src={record.profileImage} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.username}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Total Todos',
      dataIndex: ['stats', 'total'],
      key: 'totalTodos',
      align: 'center',
    },
    {
      title: 'Completed',
      dataIndex: ['stats', 'completed'],
      key: 'completed',
      align: 'center',
    },
    {
      title: 'Overdue',
      dataIndex: ['stats', 'overdue'],
      key: 'overdue',
      align: 'center',
      render: (count) => (
        <span style={{ color: count > 0 ? '#ff4d4f' : 'inherit' }}>
          {count}
        </span>
      ),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'Never',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            View
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-users">
      <Title level={2}>User Management</Title>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Input
              placeholder="Search users..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              allowClear
            />
          </Col>
          
          <Col xs={12} sm={4} md={3}>
            <Select
              placeholder="Role"
              value={filters.role}
              onChange={(value) => handleFilterChange('role', value)}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="admin">Admin</Option>
              <Option value="user">User</Option>
            </Select>
          </Col>

          <Col xs={12} sm={4} md={3}>
            <Select
              placeholder="Status"
              value={filters.isActive}
              onChange={(value) => handleFilterChange('isActive', value)}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="true">Active</Option>
              <Option value="false">Inactive</Option>
            </Select>
          </Col>

          <Col xs={24} sm={8} md={3}>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </Col>
        </Row>
      </Card>

      {/* Users Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          loading={loading}
          pagination={false}
          scroll={{ x: 800 }}
        />

        {/* Pagination */}
        {pagination.total > 0 && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Pagination
              current={pagination.current}
              total={pagination.total}
              pageSize={pagination.pageSize}
              onChange={handlePageChange}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) => 
                `${range[0]}-${range[1]} of ${total} users`
              }
            />
          </div>
        )}
      </Card>

      {/* Edit User Modal */}
      <Modal
        title="Edit User"
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setSelectedUser(null);
          form.resetFields();
        }}
        onOk={form.submit}
        confirmLoading={actionLoading}
      >
        {selectedUser && (
          <div style={{ marginBottom: 16 }}>
            <Space>
              <Avatar src={selectedUser.profileImage} icon={<UserOutlined />} />
              <div>
                <div style={{ fontWeight: 'bold' }}>{selectedUser.username}</div>
                <div style={{ color: '#666' }}>{selectedUser.email}</div>
              </div>
            </Space>
          </div>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
        >
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select a role!' }]}
          >
            <Select>
              <Option value="user">User</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Status"
            rules={[{ required: true, message: 'Please select status!' }]}
          >
            <Select>
              <Option value={true}>Active</Option>
              <Option value={false}>Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminUsers;