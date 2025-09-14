import React, { useState, useEffect } from 'react';
import { Typography, Spin, message, Button, Pagination } from 'antd';
import { CheckCircleOutlined, PlusOutlined } from '@ant-design/icons';
import apiService from '../../services/api';
import TodoForm from '../../components/Todo/TodoForm';
import TodoList from '../../components/Todo/TodoList';

const { Title, Text } = Typography;

const CompletedTodos = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todoFormOpen, setTodoFormOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    pageSize: 20
  });

  useEffect(() => {
    fetchCompletedTodos();
  }, [pagination.current]);

  const fetchCompletedTodos = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTodos({
        status: 'completed',
        page: pagination.current,
        limit: pagination.pageSize,
        sortBy: 'completedAt',
        sortOrder: 'desc'
      });
      
      if (response.success) {
        setTodos(response.data.todos);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total
        }));
      }
    } catch (error) {
      message.error('Failed to fetch completed todos');
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
        // Don't refresh completed todos since new todo won't be completed
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
        fetchCompletedTodos();
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
        fetchCompletedTodos();
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
        fetchCompletedTodos();
      }
    } catch (error) {
      message.error('Failed to update todo status');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePageChange = (page, pageSize) => {
    setPagination(prev => ({ ...prev, current: page, pageSize }));
  };

  return (
    <div className="todos-page">
      <div className="page-header">
        <div>
          <Title level={2}>
            <CheckCircleOutlined /> Completed Todos
          </Title>
          <Text type="secondary">
            Archive of all completed tasks
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

      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <TodoList
            todos={todos}
            onEdit={handleEditTodo}
            onDelete={handleDeleteTodo}
            onStatusChange={handleStatusChange}
            loading={actionLoading}
          />

          {pagination.total > 0 && (
            <div className="pagination-container">
              <Pagination
                current={pagination.current}
                total={pagination.total}
                pageSize={pagination.pageSize}
                onChange={handlePageChange}
                showSizeChanger
                showQuickJumper
                showTotal={(total, range) => 
                  `${range[0]}-${range[1]} of ${total} completed todos`
                }
              />
            </div>
          )}
        </>
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

export default CompletedTodos;