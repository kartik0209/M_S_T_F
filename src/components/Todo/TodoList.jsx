import React from 'react';
import { Card, Tag, Button, Space, Popconfirm, Typography, Empty, Badge } from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
//import './Todo.scss';

const { Text, Title } = Typography;

const TodoList = ({ 
  todos, 
  onEdit, 
  onDelete, 
  onStatusChange, 
  loading = false 
}) => {
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

  const handleStatusChange = (todo, newStatus) => {
    onStatusChange(todo._id, { status: newStatus });
  };

  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <Empty 
          description="No todos found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div className="todo-list">
      {todos.map(todo => (
        <Badge.Ribbon 
          key={todo._id}
          text={isOverdue(todo.dueDate, todo.status) ? 'OVERDUE' : null}
          color="red"
        >
          <Card
            className={`todo-card ${todo.status} ${isOverdue(todo.dueDate, todo.status) ? 'overdue' : ''}`}
            actions={[
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEdit(todo)}
                disabled={loading}
              >
                Edit
              </Button>,
              <Popconfirm
                title="Are you sure you want to delete this todo?"
                onConfirm={() => onDelete(todo._id)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  danger
                  disabled={loading}
                >
                  Delete
                </Button>
              </Popconfirm>
            ]}
          >
            <div className="todo-header">
              <Title level={5} className="todo-title">
                {todo.title}
              </Title>
              <Space>
                <Tag color={getPriorityColor(todo.priority)}>
                  {todo.priority}
                </Tag>
                <Tag color={getCategoryColor(todo.category)}>
                  {todo.category}
                </Tag>
              </Space>
            </div>

            {todo.description && (
              <Text type="secondary" className="todo-description">
                {todo.description}
              </Text>
            )}

            <div className="todo-footer">
              <div className="todo-meta">
                <Text type="secondary">
                  Due: {dayjs(todo.dueDate).format('MMM DD, YYYY HH:mm')}
                </Text>
              </div>
              
              <div className="todo-actions">
                <Tag 
                  color={getStatusColor(todo.status)}
                  icon={getStatusIcon(todo.status)}
                >
                  {todo.status.replace('-', ' ').toUpperCase()}
                </Tag>
                
                {todo.status !== 'completed' && (
                  <Space size="small">
                    {todo.status === 'pending' && (
                      <Button 
                        size="small" 
                        onClick={() => handleStatusChange(todo, 'in-progress')}
                        disabled={loading}
                      >
                        Start
                      </Button>
                    )}
                    <Button 
                      size="small" 
                      type="primary"
                      onClick={() => handleStatusChange(todo, 'completed')}
                      disabled={loading}
                    >
                      Complete
                    </Button>
                  </Space>
                )}
              </div>
            </div>
          </Card>
        </Badge.Ribbon>
      ))}
    </div>
  );
};

export default TodoList;