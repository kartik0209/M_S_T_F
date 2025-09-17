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
  Spin,
  Upload
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
const [viewModalOpen, setViewModalOpen] = useState(false);
const [viewUserData, setViewUserData] = useState(null);
const [viewLoading, setViewLoading] = useState(false);
const [addModalOpen, setAddModalOpen] = useState(false);
const [addForm] = Form.useForm();

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
const handleAddUser = async (values) => {
  try {
    setActionLoading(true);
    
    const formData = new FormData();
    formData.append('username', values.username);
    formData.append('email', values.email);
    formData.append('password', values.password);
    formData.append('role', values.role);
    
    if (values.image && values.image.file) {
      formData.append('image', values.image.file);
    }
    
    const response = await apiService.addUser(formData);
    
    if (response.success) {
      message.success('User added successfully');
      setAddModalOpen(false);
      addForm.resetFields();
      fetchUsers();
    }
  } catch (error) {
    message.error('Failed to add user');
  } finally {
    setActionLoading(false);
  }
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
  try {
    setViewLoading(true);
    setViewModalOpen(true);
    setViewUserData(user); // Set basic user data first
    
    // Try to fetch detailed stats
    const response = await apiService.getUserDetails(user._id);
    if (response.success && response.data.stats) {
      setViewUserData(prev => ({
        ...prev,
        stats: response.data.stats
      }));
    } else {
      // If API call fails, use the stats from the table data
      setViewUserData(prev => ({
        ...prev,
        stats: user.stats || { total: 0, completed: 0, pending: 0, overdue: 0 }
      }));
    }
  } catch (error) {
    console.error('Error fetching user details:', error);
    // Use fallback data from table
    setViewUserData(prev => ({
      ...prev,
      stats: user.stats || { total: 0, completed: 0, pending: 0, overdue: 0 }
    }));
  } finally {
    setViewLoading(false);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
  <Title level={2}>User Management dffdf</Title>
  <Button 
    type="primary" 
    onClick={() => setAddModalOpen(true)}
    style={{ marginBottom: 0 }}
  >
    Add User
  </Button>
</div>

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

      <Modal
  title={`${viewUserData?.username || 'User'} - Details`}
  open={viewModalOpen}
  onCancel={() => {
    setViewModalOpen(false);
    setViewUserData(null);
  }}
  footer={[
    <Button key="close" onClick={() => {
      setViewModalOpen(false);
      setViewUserData(null);
    }}>
      Close
    </Button>
  ]}
  width={600}
>
  {viewUserData && (
    <div>
      {/* User Info Section */}
      <div style={{ marginBottom: 24 }}>
        <Space>
          <Avatar src={viewUserData.profileImage} icon={<UserOutlined />} size="large" />
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{viewUserData.username}</div>
            <div style={{ color: '#666' }}>{viewUserData.email}</div>
            <Space style={{ marginTop: 4 }}>
              <Tag color={viewUserData.role === 'admin' ? 'red' : 'blue'}>
                {viewUserData.role?.toUpperCase()}
              </Tag>
              <Tag color={viewUserData.isActive ? 'green' : 'red'}>
                {viewUserData.isActive ? 'Active' : 'Inactive'}
              </Tag>
            </Space>
          </div>
        </Space>
      </div>

      {/* Statistics Section */}
      <div style={{ marginBottom: 24 }}>
        <h4>Todo Statistics</h4>
        {viewLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin />
          </div>
        ) : (
          <Row gutter={16}>
            <Col span={6}>
              <Statistic 
                title="Total Todos" 
                value={viewUserData.stats?.total || 0} 
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="Completed" 
                value={viewUserData.stats?.completed || 0}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="Pending" 
                value={viewUserData.stats?.pending || 0}
                valueStyle={{ color: '#faad14' }}
              />
            </Col>
            <Col span={6}>
              <Statistic 
                title="Overdue" 
                value={viewUserData.stats?.overdue || 0}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Col>
          </Row>
        )}
      </div>

      {/* Additional Info Section */}
      <div>
        <h4>Account Information</h4>
        <div style={{ marginLeft: 16 }}>
          <p><strong>Last Login:</strong> {viewUserData.lastLogin ? new Date(viewUserData.lastLogin).toLocaleString() : 'Never'}</p>
          <p><strong>Member Since:</strong> {new Date(viewUserData.createdAt).toLocaleDateString()}</p>
          <p><strong>Account ID:</strong> {viewUserData._id}</p>
        </div>
      </div>
    </div>
  )}
</Modal>



<Modal
  title="Add New User"
  open={addModalOpen}
  onCancel={() => {
    setAddModalOpen(false);
    addForm.resetFields();
  }}
  onOk={addForm.submit}
  confirmLoading={actionLoading}
  width={500}
>
  <Form
    form={addForm}
    layout="vertical"
    onFinish={handleAddUser}
  >
    <Form.Item
      name="username"
      label="Username"
      rules={[{ required: true, message: 'Please enter username!' }]}
    >
      <Input placeholder="Enter username" />
    </Form.Item>

    <Form.Item
      name="email"
      label="Email"
      rules={[
        { required: true, message: 'Please enter email!' },
        { type: 'email', message: 'Please enter valid email!' }
      ]}
    >
      <Input placeholder="Enter email address" />
    </Form.Item>

    <Form.Item
      name="password"
      label="Password"
      rules={[
        { required: true, message: 'Please enter password!' },
        { min: 6, message: 'Password must be at least 6 characters!' }
      ]}
    >
      <Input.Password placeholder="Enter password" />
    </Form.Item>

    <Form.Item
      name="role"
      label="Role"
      rules={[{ required: true, message: 'Please select a role!' }]}
      initialValue="user"
    >
      <Select>
        <Option value="user">User</Option>
        <Option value="admin">Admin</Option>
      </Select>
    </Form.Item>

    <Form.Item
      name="image"
      label="Profile Image (Optional)"
    >
      <Upload
        beforeUpload={() => false}
        maxCount={1}
        accept="image/*"
        listType="picture-card"
      >
        <div>
          <div style={{ marginTop: 8 }}>Upload</div>
        </div>
      </Upload>
    </Form.Item>
  </Form>
</Modal>













    </div>
  );
};

export default AdminUsers;