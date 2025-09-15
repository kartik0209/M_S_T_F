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
  CheckCircleOutlined,
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
      console.error('Fetch reports error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!reportData) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px', 
        color: '#666' 
      }}>
        No report data available
      </div>
    );
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
          <Avatar 
            src={record.profileImage} 
            icon={<UserOutlined />} 
            size="small" 
          />
          <div>
            <div style={{ fontWeight: 500 }}>{record.username}</div>
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
      render: (completed, record) => (
        <div>
          <div>{completed}</div>
          <div style={{ fontSize: '12px', color: '#52c41a' }}>
            {record.totalTodos > 0 ? Math.round((completed / record.totalTodos) * 100) : 0}%
          </div>
        </div>
      ),
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
    <div className="admin-reports" style={{ padding: '0 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 8 }}>Analytics & Reports</Title>
        <div style={{ color: '#666', fontSize: '14px' }}>
          Generated at: {new Date(reportData.generatedAt || new Date()).toLocaleString()}
        </div>
      </div>

      {/* Performance Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Total Users"
              value={performanceMetrics?.totalUsers || 0}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: 8 }}>
              {performanceMetrics?.activeUsers || 0} active users
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Total Todos"
              value={performanceMetrics?.totalTodos || 0}
              prefix={<UnorderedListOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: 8 }}>
              All time todos created
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Completion Rate"
              value={performanceMetrics?.completionRate || 0}
              suffix="%"
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: 8 }}>
              Overall completion rate
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Avg Tasks/User (7d)"
              value={performanceMetrics?.avgTasksLast7Days || 0}
              precision={1}
              prefix={<BarChartOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: 8 }}>
              Recent productivity
            </div>
          </Card>
        </Col>
      </Row>

      {/* Productivity Trends Chart */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="Productivity Trends (Last 30 Days)" hoverable>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#8884d8" 
                    strokeWidth={2} 
                    name="Total Tasks" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="#82ca9d" 
                    strokeWidth={2} 
                    name="Completed" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pending" 
                    stroke="#ffc658" 
                    strokeWidth={2} 
                    name="Pending" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="inProgress" 
                    stroke="#ff7c7c" 
                    strokeWidth={2} 
                    name="In Progress" 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px', 
                color: '#999',
                fontSize: '16px'
              }}>
                No trend data available
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Distribution Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Task Status Distribution" hoverable>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { 
                      name: 'Completed', 
                      value: performanceMetrics?.completionRate || 0, 
                      fill: '#52c41a' 
                    },
                    { 
                      name: 'Incomplete', 
                      value: 100 - (performanceMetrics?.completionRate || 0), 
                      fill: '#faad14' 
                    }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${percent.toFixed(0)}%`}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="User Engagement" hoverable>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { 
                  name: 'Active Users', 
                  value: performanceMetrics?.activeUsers || 0, 
                  fill: '#52c41a' 
                },
                { 
                  name: 'Inactive Users', 
                  value: (performanceMetrics?.totalUsers || 0) - (performanceMetrics?.activeUsers || 0), 
                  fill: '#ff4d4f' 
                }
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

      {/* Weekly Comparison */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Weekly Comparison" hoverable>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="This Week"
                  value="Coming Soon"
                  valueStyle={{ fontSize: '16px', color: '#666' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Last Week"
                  value="Coming Soon"
                  valueStyle={{ fontSize: '16px', color: '#666' }}
                />
              </Col>
            </Row>
            <div style={{ 
              marginTop: 16, 
              padding: '12px', 
              backgroundColor: '#f0f2f5', 
              borderRadius: '6px',
              textAlign: 'center',
              color: '#666'
            }}>
              Weekly comparison metrics will be available in future updates
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Average Tasks Per User" hoverable>
            <Statistic
              value={userActivityReport?.length > 0 
                ? (userActivityReport.reduce((acc, user) => acc + (user.recentActivity || 0), 0) / userActivityReport.length) 
                : 0
              }
              precision={1}
              valueStyle={{ fontSize: '28px', color: '#1890ff' }}
              suffix="tasks/week"
            />
            <div style={{ marginTop: 12, color: '#666', fontSize: '14px' }}>
              Based on {userActivityReport?.length || 0} users (last 7 days)
            </div>
          </Card>
        </Col>
      </Row>

      {/* User Activity Report */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card 
            title="User Activity Report" 
            extra={
              <Tag color="blue">
                Top {Math.min(userActivityReport?.length || 0, 20)} Most Active Users
              </Tag>
            }
            hoverable
          >
            {userActivityReport?.length > 0 ? (
              <Table
                columns={userColumns}
                dataSource={userActivityReport.slice(0, 20)}
                rowKey="_id"
                pagination={false}
                size="small"
                scroll={{ x: 800 }}
              />
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: '#999',
                fontSize: '16px'
              }}>
                No user activity data available
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminReports;