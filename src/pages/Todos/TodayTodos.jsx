import React, { useState, useEffect } from 'react';
import { Typography, Spin, message, Button } from 'antd';
import { PlusOutlined, CalendarOutlined } from '@ant-design/icons';
import apiService from '../../services/api';
import TodoForm from '../../components/Todo/TodoForm';
import TodoList from '../../components/Todo/TodoList';

const { Title, Text } = Typography;

const TodayTodos = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todoFormOpen, setTodoFormOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTodayTodos();
  }, []);

  const fetchTodayTodos = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTodaysTodos();
      
      if (response.success) {
        setTodos(response.data.todos);
      }
    } catch (error) {
      message.error('Failed to fetch today\'s todos');
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
        fetchTodayTodos(); // Refresh today's todos
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
        fetchTodayTodos();
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
        fetchTodayTodos();
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
        fetchTodayTodos();
      }
    } catch (error) {
      message.error('Failed to update todo status');
    } finally {
      setActionLoading(false);
    }
  };

  const completedCount = todos.filter(todo => todo.status === 'completed').length;
  const pendingCount = todos.filter(todo => todo.status !== 'completed').length;

  return (
    <div className="todos-page">
      <div className="page-header">
        <div>
          <Title level={2}>
            <CalendarOutlined /> Today's Todos
          </Title>
          <Text type="secondary">
            {todos.length} tasks today • {completedCount} completed • {pendingCount} remaining
          </Text>
        </div>
     
      </div>

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

export default TodayTodos;