import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  message, 
  Spin, 
  Typography,
  Table,
  Avatar,
  Progress,
  Tag
} from 'antd';
import { 
  UserOutlined,
  UnorderedListOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line
} from 'recharts';
import apiService from '../../services/api';
import './Admin.scss';

const { Title } = Typography;

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminDashboard();
      
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      message.error('Failed to fetch dashboard data');
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

  if (!dashboardData) {
    return <div>No data available</div>;
  }

  const { summary, charts } = dashboardData;
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Active users table columns
  const userColumns = [
    {
      title: 'User',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar src={record.profileImage} icon={<UserOutlined />} size="small" />
          <div>
            <div>{record.username}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Total Tasks',
      dataIndex: 'todoCount',
      key: 'todoCount',
      align: 'center',
    },
    {
      title: 'Completed',
      dataIndex: 'completedCount',
      key: 'completedCount',
      align: 'center',
    },
    {
      title: 'Completion Rate',
      dataIndex: 'completionRate',
      key: 'completionRate',
      align: 'center',
      render: (rate) => (
        <Progress 
          percent={rate} 
          size="small" 
          status={rate > 70 ? 'success' : rate > 40 ? 'normal' : 'exception'}
        />
      ),
    },
  ];

  // Format daily activity data
  const dailyActivityData = charts.dailyActivity?.map(item => ({
    date: new Date(item._id.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    tasks: item.count
  })) || [];

  return (
    <div className="admin-dashboard">
      <Title level={2}>Admin Dashboard</Title>

      {/* Summary Statistics */}
      <Row gutter={[16, 16]} className="stats-row">

          <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setTodoFormOpen(true)}
          size="large"
        >
          Add Todo
        </Button>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={summary.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div className="stat-extra">
              +{summary.recentUsers} this week
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Todos"
              value={summary.totalTodos}
              prefix={<UnorderedListOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <div className="stat-extra">
              +{summary.recentTodos} this week
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Completed"
              value={summary.completedTodos}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div className="stat-extra">
              {summary.completionRate}% completion rate
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Overdue"
              value={summary.overdueTodos}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} className="charts-row">
        <Col xs={24} lg={8}>
          <Card title="Tasks by Status">
            {charts.statusStats?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={charts.statusStats.map(item => ({
                      name: item._id,
                      value: item.count
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {charts.statusStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">No data available</div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Tasks by Category">
            {charts.categoryStats?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts.categoryStats.map(item => ({
                  name: item._id,
                  value: item.count
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">No data available</div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Tasks by Priority">
            {charts.priorityStats?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={charts.priorityStats.map(item => ({
                      name: item._id,
                      value: item.count,
                      fill: item._id === 'High' ? '#ff4d4f' : item._id === 'Medium' ? '#faad14' : '#52c41a'
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {charts.priorityStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">No data available</div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Daily Activity Chart */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Daily Activity (Last 30 Days)">
            {dailyActivityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="tasks" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">No data available</div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Most Active Users */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Most Active Users" extra={<TrophyOutlined />}>
            <Table
              columns={userColumns}
              dataSource={charts.activeUsers}
              rowKey="_id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;