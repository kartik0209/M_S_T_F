import React, { useState, useEffect } from 'react';
import {
  Card,
  Statistic,
  Row,
  Col,
  message,
  Spin,
  Typography,
  Table,
  Tag,
  Avatar
} from 'antd';
import {
  UserOutlined,
  UnorderedListOutlined,

  BarChartOutlined
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import apiService from '../../services/api';

const { Title } = Typography;

const AdminReports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminReports();
      
      if (response.success) {
        setReportData(response.data);
      }
    } catch (error) {
      message.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  if (!reportData) {
    return <div>No report data available</div>;
  }

  const { userActivityReport, productivityTrends, performanceMetrics } = reportData;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Format productivity trends data for charts
  const trendData = productivityTrends?.map(item => ({
    date: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    total: item.totalTodos,
    completed: item.statuses?.find(s => s.status === 'completed')?.count || 0,
    pending: item.statuses?.find(s => s.status === 'pending')?.count || 0,
    inProgress: item.statuses?.find(s => s.status === 'in-progress')?.count || 0
  })) || [];

  // User activity table columns
  const userColumns = [
    {
      title: 'User',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar icon={<UserOutlined />} size="small" />
          <div>
            <div>{record.username}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Total Todos',
      dataIndex: 'totalTodos',
      key: 'totalTodos',
      align: 'center',
      sorter: (a, b) => a.totalTodos - b.totalTodos,
    },
    {
      title: 'Completed',
      dataIndex: 'completedTodos',
      key: 'completedTodos',
      align: 'center',
      sorter: (a, b) => a.completedTodos - b.completedTodos,
    },
    {
      title: 'Recent Activity (7d)',
      dataIndex: 'recentActivity',
      key: 'recentActivity',
      align: 'center',
      sorter: (a, b) => a.recentActivity - b.recentActivity,
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
      title: 'Join Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    }
  ];

  return (
    <div className="admin-reports">
      <Title level={2}>Analytics & Reports</Title>
      
      <div style={{ marginBottom: 16, color: '#666' }}>
        Generated at: {new Date(reportData.generatedAt).toLocaleString()}
      </div>

      {/* Performance Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={performanceMetrics.totalUsers}
              prefix={<UserOutlined />}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: 8 }}>
              {performanceMetrics.activeUsers} active users
            </div>
          </Card>
        </Col>
        </Row>
        
<Col xs={24} sm={12} md={6}>
  <Card>
    <Statistic
      title="Total Todos"
      value={performanceMetrics.totalTodos}
      prefix={<UnorderedListOutlined />}
    />
  </Card>
</Col>

      {/* Productivity Trends Chart */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="Productivity Trends (Last 30 Days)">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} name="Total Tasks" />
                  <Line type="monotone" dataKey="completed" stroke="#82ca9d" strokeWidth={2} name="Completed" />
                  <Line type="monotone" dataKey="pending" stroke="#ffc658" strokeWidth={2} name="Pending" />
                  <Line type="monotone" dataKey="inProgress" stroke="#ff7c7c" strokeWidth={2} name="In Progress" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">No trend data available</div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Weekly Comparison */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="This Week vs Last Week">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="This Week"
                  value="New feature - coming soon"
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Last Week"
                  value="New feature - coming soon"
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Average Tasks Added Per User (7 days)">
            <Statistic
              value={userActivityReport?.reduce((acc, user) => acc + user.recentActivity, 0) / Math.max(userActivityReport?.length || 1, 1)}
              precision={1}
              valueStyle={{ fontSize: '28px', color: '#1890ff' }}
            />
            <div style={{ marginTop: 8, color: '#666', fontSize: '14px' }}>
              Based on {userActivityReport?.length || 0} active users
            </div>
          </Card>
        </Col>
      </Row>

      {/* Distribution Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Task Status Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Completed', value: performanceMetrics.completionRate, fill: '#52c41a' },
                    { name: 'Incomplete', value: 100 - performanceMetrics.completionRate, fill: '#faad14' }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${percent.toFixed(0)}%`}
                >
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="User Engagement">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Active Users', value: performanceMetrics.activeUsers, fill: '#52c41a' },
                { name: 'Inactive Users', value: performanceMetrics.totalUsers - performanceMetrics.activeUsers, fill: '#ff4d4f' }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* User Activity Report */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="User Activity Report" extra="Top 20 Most Active Users">
            <Table
              columns={userColumns}
              dataSource={userActivityReport?.slice(0, 20)}
              rowKey="_id"
              pagination={false}
              size="small"
              scroll={{ x: 800 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminReports;
