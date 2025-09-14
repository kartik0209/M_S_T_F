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
  Typography,
  Row,
  Col
} from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import apiService from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

const AdminTodos = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    pageSize: 20
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    priority: '',
    userId: ''
  });

  useEffect(() => {
    fetchTodos();
  }, [pagination.current, filters]);

  const fetchTodos = async () => {
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

      const response = await apiService.getAllTodos(params);

      if (response.success) {
        setTodos(response.data.todos);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total
        }));
      }
    } catch (error) {
      message.error('Failed to fetch todos');
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

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      category: '',
      priority: '',
      userId: ''
    });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'red',
      'Medium': 'orange',
      'Low': 'green'
    };
    return colors[priority] || 'default';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Work': 'blue',
      'Personal': 'purple',
      'Health': 'green',
      'Education': 'orange',
      'Shopping': 'cyan',
      'Other': 'default'
    };
    return colors[category] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'default',
      'in-progress': 'processing',
      'completed': 'success'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': <ClockCircleOutlined />,
      'in-progress': <ExclamationCircleOutlined />,
      'completed': <CheckCircleOutlined />
    };
    return icons[status] || <ClockCircleOutlined />;
  };

  const isOverdue = (dueDate, status) => {
    return status !== 'completed' && dayjs().isAfter(dayjs(dueDate));
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text, record) => (
        <div>
          <Text strong={record.status !== 'completed'}>
            {text}
          </Text>
          {isOverdue(record.dueDate, record.status) && (
            <Tag color="red" size="small" style={{ marginLeft: 8 }}>
              OVERDUE
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'User',
      dataIndex: 'userId',
      key: 'userId',
      render: (user) => (
        <Space>
          <Avatar src={user?.profileImage} icon={<UserOutlined />} size="small" />
          <div>
            <div style={{ fontSize: '12px' }}>{user?.username}</div>
            <div style={{ fontSize: '10px', color: '#666' }}>{user?.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status.replace('-', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>
          {priority}
        </Tag>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color={getCategoryColor(category)}>
          {category}
        </Tag>
      ),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date, record) => (
        <span style={{ 
          color: isOverdue(date, record.status) ? '#ff4d4f' : 'inherit' 
        }}>
          {dayjs(date).format('MMM DD, YYYY HH:mm')}
        </span>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => {
            // Show todo details in a modal
            message.info('Todo details view would open here');
          }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="admin-todos">
      <Title level={2}>All Todos</Title>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={5}>
            <Input
              placeholder="Search todos..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              allowClear
            />
          </Col>
          
          <Col xs={12} sm={4} md={3}>
            <Select
              placeholder="Status"
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="pending">Pending</Option>
              <Option value="in-progress">In Progress</Option>
              <Option value="completed">Completed</Option>
            </Select>
          </Col>

          <Col xs={12} sm={4} md={3}>
            <Select
              placeholder="Category"
              value={filters.category}
              onChange={(value) => handleFilterChange('category', value)}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="Work">Work</Option>
              <Option value="Personal">Personal</Option>
              <Option value="Health">Health</Option>
              <Option value="Education">Education</Option>
              <Option value="Shopping">Shopping</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Col>

          <Col xs={12} sm={4} md={3}>
            <Select
              placeholder="Priority"
              value={filters.priority}
              onChange={(value) => handleFilterChange('priority', value)}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="High">High</Option>
              <Option value="Medium">Medium</Option>
              <Option value="Low">Low</Option>
            </Select>
          </Col>

          <Col xs={12} sm={4} md={3}>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </Col>
        </Row>
      </Card>

      {/* Todos Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={todos}
          rowKey="_id"
          loading={loading}
          pagination={false}
          scroll={{ x: 1000 }}
          rowClassName={(record) => 
            isOverdue(record.dueDate, record.status) ? 'overdue-row' : ''
          }
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
                `${range[0]}-${range[1]} of ${total} todos`
              }
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminTodos;