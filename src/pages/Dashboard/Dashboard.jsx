import { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Button, 
  message, 
  Spin, 
  Typography,
  Progress 
} from 'antd';
import { 
  PlusOutlined, 
  UnorderedListOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined 
} from '@ant-design/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import apiService from '../../services/api';
import TodoForm from '../../components/Todo/TodoForm';
import TodoList from '../../components/Todo/TodoList';
import './Dashboard.scss';

const { Title } = Typography;

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentTodos, setRecentTodos] = useState([]);
  const [todayTodos, setTodayTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todoFormOpen, setTodoFormOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, todosResponse, todayResponse] = await Promise.all([
        apiService.getUserStats(),
        apiService.getTodos({ limit: 5 }),
        apiService.getTodaysTodos()
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
      
      if (todosResponse.success) {
        setRecentTodos(todosResponse.data.todos);
      }

      if (todayResponse.success) {
        setTodayTodos(todayResponse.data.todos);
      }
    } catch {
      message.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTodo = async (todoData) => {
    try {
      setActionLoading(true);
      const response = await apiService.createTodo(todoData);
      if (response.success) {
        message.success('Todo created successfully');
        fetchDashboardData();
      }
    } catch {
      message.error('Failed to create todo');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditTodo = (todo) => {
    setSelectedTodo(todo);
    setTodoFormOpen(true);
  };

  const handleUpdateTodo = async (todoData) => {
    try {
      setActionLoading(true);
      const response = await apiService.updateTodo(selectedTodo._id, todoData);
      if (response.success) {
        message.success('Todo updated successfully');
        fetchDashboardData();
        setSelectedTodo(null);
      }
    } catch {
      message.error('Failed to update todo');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTodo = async (todoId) => {
    try {
      setActionLoading(true);
      const response = await apiService.deleteTodo(todoId);
      if (response.success) {
        message.success('Todo deleted successfully');
        fetchDashboardData();
      }
    } catch {
      message.error('Failed to delete todo');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (todoId, updateData) => {
    try {
      setActionLoading(true);
      const response = await apiService.updateTodo(todoId, updateData);
      if (response.success) {
        message.success('Todo status updated');
        fetchDashboardData();
      }
    } catch {
      message.error('Failed to update todo status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  let completionRate = 0;
  if (stats?.summary?.total > 0) {
    completionRate = Math.round((stats.summary.completed / stats.summary.total) * 100);
  }

  const categoryChartData = stats?.categoryStats?.map(item => ({
    name: item._id,
    value: item.count
  })) || [];
  const priorityChartData = stats?.priorityStats?.map(item => {
    let fillColor;
    if (item._id === 'High') {
      fillColor = '#ff4d4f';
    } else if (item._id === 'Medium') {
      fillColor = '#faad14';
    } else {
      fillColor = '#52c41a';
// Removed unused handleGroupChange function
    setLoading(true);
    const response = await apiService.getTodosByGroup(group);
    if (response.success) {
      setTodos(response.data.todos);
    }
  } catch (error) {
    message.error('Failed to fetch grouped todos');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <Title level={2}>Dashboard</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setTodoFormOpen(true)}
          size="large"
        >
          Add Todo
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Todos"
              value={stats?.summary?.total || 0}
              prefix={<UnorderedListOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Completed"
              value={stats?.summary?.completed || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending"
              value={stats?.summary?.pending || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Overdue"
              value={stats?.summary?.overdue || 0}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Completion Rate */}
      <Row gutter={[16, 16]} className="progress-row">
        <Col span={24}>
          <Card title="Completion Rate">
            <Progress 
              percent={completionRate} 
            <Progress 
              percent={completionRate} 
              status={
                completionRate > 70
                  ? 'success'
                  : completionRate > 40
                  ? 'normal'
                  : 'exception'
              }
              strokeWidth={12}
              format={percent => `${percent}%`}
            />
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} className="charts-row">
        <Col xs={24} lg={12}>
          <Card title="Tasks by Category">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    {categoryChartData.map((entry) => (
                      <Cell key={entry.name} fill={COLORS[categoryChartData.findIndex(e => e.name === entry.name) % COLORS.length]} />
                    ))}
                  >
                    {categoryChartData.map((entry, index) => (
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

        <Col xs={24} lg={12}>
          <Card title="Tasks by Priority">
            {priorityChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priorityChartData}>
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
      </Row>

      {/* Recent Todos and Today's Todos */}
      <Row gutter={[16, 16]} className="todos-row">
        <Col xs={24} lg={12}>
          <Card title="Recent Todos" extra={<Button type="link">View All</Button>}>
            <TodoList
              todos={recentTodos}
              onEdit={handleEditTodo}
              onDelete={handleDeleteTodo}
              onStatusChange={handleStatusChange}
              loading={actionLoading}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Today's Todos">
            <TodoList
              todos={todayTodos}
              onEdit={handleEditTodo}
              onDelete={handleDeleteTodo}
              onStatusChange={handleStatusChange}
              loading={actionLoading}
            />
            </Card>
      {/* Todo Form Modal - Completed */}
        </Col>
      </Row>

      {/* Todo Form Modal */}
      <TodoForm
        open={todoFormOpen}
        onClose={() => {
          setTodoFormOpen(false);
          setSelectedTodo(null);
        }}
        onSubmit={selectedTodo ? handleUpdateTodo : handleCreateTodo}
        todo={selectedTodo}
        loading={actionLoading}
      />
    </div>
  );
};

export default Dashboard;