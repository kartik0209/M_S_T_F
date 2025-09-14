import React, { useState, useEffect } from 'react';
import { Typography, Spin, message, Button, Alert } from 'antd';
import { ExclamationCircleOutlined, PlusOutlined, WarningOutlined } from '@ant-design/icons';
import apiService from '../../services/api';
import TodoForm from '../../components/Todo/TodoForm';
import TodoList from '../../components/Todo/TodoList';

const { Title, Text } = Typography;

const OverdueTodos = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todoFormOpen, setTodoFormOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchOverdueTodos();
  }, []);

  const fetchOverdueTodos = async () => {
    try {
      setLoading(true);
      const response = await apiService.getOverdueTodos();
      
      if (response.success) {
        setTodos(response.data.todos);
      }
    } catch (error) {
      message.error('Failed to fetch overdue todos');
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
        // Don't refresh overdue todos since new todo won't be overdue
      }
    } catch (error) {
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
        fetchOverdueTodos();
        setSelectedTodo(null);
      }
    } catch (error) {
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
        fetchOverdueTodos();
      }
    } catch (error) {
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
        fetchOverdueTodos();
      }
    } catch (error) {
      message.error('Failed to update todo status');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="todos-page">
      <div className="page-header">
        <div>
          <Title level={2}>
            <ExclamationCircleOutlined /> Overdue Todos
          </Title>
          <Text type="secondary">
            Tasks that have passed their due date
          </Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setTodoFormOpen(true)}
          size="large"
        >
          Add Todo
        </Button>
      </div>

      {todos.length > 0 && (
        <Alert
          message="Overdue Tasks Alert"
          description={`You have ${todos.length} overdue task${todos.length > 1 ? 's' : ''}. Please review and update them as needed.`}
          type="warning"
          icon={<WarningOutlined />}
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : (
        <TodoList
          todos={todos}
          onEdit={handleEditTodo}
          onDelete={handleDeleteTodo}
          onStatusChange={handleStatusChange}
          loading={actionLoading}
        />
      )}

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

export default OverdueTodos;