import React, { useState, useEffect } from "react";
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
  Col,
  Modal,
  Form,
  DatePicker,
  Descriptions,
  Dropdown,
  Checkbox
} from "antd";
import {
  UserOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
  MoreOutlined,
  PlusOutlined
} from "@ant-design/icons";
import dayjs from 'dayjs';
import apiService from "../../services/api";
import TodoForm from "../../components/Todo/TodoForm";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AllTodos = () => {
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
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [todoFormOpen, setTodoFormOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [form] = Form.useForm();
  const [viewType, setViewType] = useState("table"); // "table" | "board"
  const [checkboxLoading, setCheckboxLoading] = useState({}); // Track loading state for individual checkboxes

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

      const response = await apiService.getTodos(params);

      if (response.success) {
        setTodos(response.data.todos);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total
        }));
      }
    } catch (error) {
      message.error('Failed to fetch todos');
      console.error('Fetch todos error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle checkbox change for task completion
  const handleCheckboxChange = async (todoId, checked) => {
    setCheckboxLoading(prev => ({ ...prev, [todoId]: true }));
    
    try {
      const newStatus = checked ? 'completed' : 'pending';
      const updateData = {
        status: newStatus,
        completed: checked
      };

      // Optimistically update the UI
      setTodos(prev =>
        prev.map(todo =>
          todo._id === todoId 
            ? { ...todo, status: newStatus, completed: checked }
            : todo
        )
      );

      const response = await apiService.updateTodo(todoId, updateData);
      
      if (response.success) {
        message.success(checked ? 'Task marked as completed!' : 'Task marked as pending!');
      } else {
        // Revert optimistic update if API call failed
        setTodos(prev =>
          prev.map(todo =>
            todo._id === todoId 
              ? { ...todo, status: checked ? 'pending' : 'completed', completed: !checked }
              : todo
          )
        );
        message.error('Failed to update task status');
      }
    } catch (error) {
      // Revert optimistic update if API call failed
      setTodos(prev =>
        prev.map(todo =>
          todo._id === todoId 
            ? { ...todo, status: checked ? 'pending' : 'completed', completed: !checked }
            : todo
        )
      );
      message.error('Failed to update task status');
      console.error('Update task status error:', error);
    } finally {
      setCheckboxLoading(prev => ({ ...prev, [todoId]: false }));
    }
  };

  // Handle Create Todo
  const handleCreateTodo = async (todoData) => {
    try {
      setActionLoading(true);
      const response = await apiService.createTodo(todoData);
      if (response.success) {
        message.success("Todo created successfully");
        fetchTodos();
        setTodoFormOpen(false);
      }
    } catch (error) {
      message.error("Failed to create todo");
    } finally {
      setActionLoading(false);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, todoId) => {
    e.dataTransfer.setData("todoId", todoId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const todoId = e.dataTransfer.getData("todoId");

    if (!todoId) return;

    // Optimistic update
    setTodos(prev =>
      prev.map(todo =>
        todo._id === todoId ? { 
          ...todo, 
          status: newStatus,
          completed: newStatus === 'completed'
        } : todo
      )
    );

    // Call API
    const success = await onStatusChange(todoId, { 
      status: newStatus,
      completed: newStatus === 'completed'
    });
    if (!success) {
      fetchTodos(); // revert if failed
    }
  };

  const onStatusChange = async (todoId, updateData) => {
    try {
      const response = await apiService.updateTodo(todoId, updateData);
      if (response.success) {
        // Update the local state to reflect the change
        setTodos(prevTodos =>
          prevTodos.map(todo =>
            todo._id === todoId ? { ...todo, ...updateData } : todo
          )
        );
        message.success("Task status updated!");
        return true;
      }
      message.error("Failed to update task");
      return false;
    } catch (err) {
      message.error("Failed to update task");
      console.error("Update status error:", err);
      return false;
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
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  // View Todo Details
  const handleViewTodo = (todo) => {
    setSelectedTodo(todo);
    setViewModalOpen(true);
  };

  // Edit Todo
  const handleEditTodo = (todo) => {
    setSelectedTodo(todo);
    form.setFieldsValue({
      title: todo.title,
      description: todo.description,
      category: todo.category,
      priority: todo.priority,
      status: todo.status || 'pending',
      dueDate: todo.dueDate ? dayjs(todo.dueDate) : null,
    });
    setEditModalOpen(true);
  };

  // Update Todo
  const handleUpdateTodo = async (values) => {
    try {
      setActionLoading(true);
      const updateData = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.toISOString() : selectedTodo.dueDate,
        completed: values.status === 'completed'
      };

      const response = await apiService.updateTodo(selectedTodo._id, updateData);
      
      if (response.success) {
        message.success('Todo updated successfully');
        setEditModalOpen(false);
        setSelectedTodo(null);
        form.resetFields();
        fetchTodos();
      }
    } catch (error) {
      message.error('Failed to update todo');
      console.error('Update todo error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Todo
  const handleDeleteTodo = (todoId, todoTitle) => {
    Modal.confirm({
      title: 'Delete Todo',
      content: `Are you sure you want to delete "${todoTitle}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await apiService.deleteTodo(todoId);
          if (response.success) {
            message.success('Todo deleted successfully');
            fetchTodos();
          }
        } catch (error) {
          message.error('Failed to delete todo');
          console.error('Delete todo error:', error);
        }
      }
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
      title: '',
      key: 'checkbox',
      width: 50,
      render: (_, record) => (
        <Checkbox
          checked={record.status === 'completed' || record.completed}
          onChange={(e) => handleCheckboxChange(record._id, e.target.checked)}
          loading={checkboxLoading[record._id]}
        />
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text, record) => (
        <div>
          <Text 
            strong={record.status !== 'completed'}
            style={{
              textDecoration: record.status === 'completed' ? 'line-through' : 'none',
              color: record.status === 'completed' ? '#999' : 'inherit'
            }}
          >
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {(status || 'pending').replace('-', ' ').toUpperCase()}
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
        date ? (
          <span style={{ 
            color: isOverdue(date, record.status) ? '#ff4d4f' : 'inherit' 
          }}>
            {dayjs(date).format('MMM DD, YYYY HH:mm')}
          </span>
        ) : 'No due date'
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
      width: 80,
      render: (_, record) => {
        const menuItems = [
          {
            key: 'view',
            label: 'View Details',
            icon: <EyeOutlined />,
            onClick: () => handleViewTodo(record)
          },
          {
            key: 'edit',
            label: 'Edit',
            icon: <EditOutlined />,
            onClick: () => handleEditTodo(record)
          },
          {
            type: 'divider'
          },
          {
            key: 'delete',
            label: 'Delete',
            icon: <DeleteOutlined />,
            onClick: () => handleDeleteTodo(record._id, record.title),
            danger: true
          }
        ];

        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<MoreOutlined />}
              onClick={(e) => e.preventDefault()}
            />
          </Dropdown>
        );
      },
    },
  ];

  const renderBoardView = () => {
    const statuses = ["pending", "in-progress", "completed"];

    return (
      <Row gutter={16} style={{ marginTop: 16 }}>
        {statuses.map((status) => (
          <Col span={8} key={status}>
            <Card
              title={status.replace("-", " ").toUpperCase()}
              bordered
              style={{
                minHeight: "70vh",
                background: "#fafafa",
              }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              {todos
                .filter((todo) => (todo.status || "pending") === status)
                .map((todo) => (
                  <Card
                    key={todo._id}
                    size="small"
                    draggable
                    onDragStart={(e) => handleDragStart(e, todo._id)}
                    style={{
                      marginBottom: 12,
                      borderRadius: 8,
                      cursor: "grab",
                      background: "white",
                      opacity: todo.status === 'completed' ? 0.8 : 1,
                    }}
                    actions={[
                      <Checkbox
                        key="checkbox"
                        checked={todo.status === 'completed' || todo.completed}
                        onChange={(e) => handleCheckboxChange(todo._id, e.target.checked)}
                        loading={checkboxLoading[todo._id]}
                      />,
                      <EyeOutlined key="view" onClick={() => handleViewTodo(todo)} />,
                      <EditOutlined key="edit" onClick={() => handleEditTodo(todo)} />,
                      <DeleteOutlined
                        key="delete"
                        onClick={() => handleDeleteTodo(todo._id, todo.title)}
                      />,
                    ]}
                  >
                    <Card.Meta
                      title={
                        <div>
                          <span style={{
                            textDecoration: todo.status === 'completed' ? 'line-through' : 'none',
                            color: todo.status === 'completed' ? '#999' : 'inherit'
                          }}>
                            {todo.title}
                          </span>
                          {isOverdue(todo.dueDate, todo.status) && (
                            <Tag color="red" style={{ marginLeft: 8 }}>
                              OVERDUE
                            </Tag>
                          )}
                        </div>
                      }
                      description={
                        <div>
                          <div style={{ marginBottom: 8, fontSize: '12px', color: '#666' }}>
                            {todo.description}
                          </div>
                          <Tag color={getPriorityColor(todo.priority)}>
                            {todo.priority}
                          </Tag>
                          <Tag color={getCategoryColor(todo.category)}>
                            {todo.category}
                          </Tag>
                          {todo.dueDate && (
                            <div style={{ fontSize: 12, marginTop: 4 }}>
                              Due: {dayjs(todo.dueDate).format("MMM DD, YYYY")}
                            </div>
                          )}
                        </div>
                      }
                    />
                  </Card>
                ))}
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <div className="todos-page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>My Todos</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setTodoFormOpen(true)}
          size="large"
        >
          Add Todo
        </Button>
      </div>

      {/* View Toggle */}
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button 
            type={viewType === "table" ? "primary" : "default"} 
            onClick={() => setViewType("table")}
          >
            Table View
          </Button>
          <Button 
            type={viewType === "board" ? "primary" : "default"} 
            onClick={() => setViewType("board")}
          >
            Board View
          </Button>
        </Space>
      </div>

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

      {/* Todos Display */}
      {viewType === "table" ? (
        <Card>
          <Table
            columns={columns}
            dataSource={todos}
            rowKey="_id"
            loading={loading}
            pagination={false}
            scroll={{ x: 1000 }}
            rowClassName={(record) => {
              let className = '';
              if (isOverdue(record.dueDate, record.status)) {
                className += 'overdue-row ';
              }
              if (record.status === 'completed') {
                className += 'completed-row ';
              }
              return className.trim();
            }}
          />
          {pagination.total > 0 && (
            <div style={{ marginTop: 16, textAlign: "center" }}>
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
      ) : (
        renderBoardView()
      )}

      {/* View Todo Modal */}
      <Modal
        title="Todo Details"
        open={viewModalOpen}
        onCancel={() => {
          setViewModalOpen(false);
          setSelectedTodo(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setViewModalOpen(false);
            setSelectedTodo(null);
          }}>
            Close
          </Button>
        ]}
        width={700}
      >
        {selectedTodo && (
          <div>
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Checkbox
                checked={selectedTodo.status === 'completed' || selectedTodo.completed}
                onChange={(e) => {
                  handleCheckboxChange(selectedTodo._id, e.target.checked);
                  setSelectedTodo(prev => ({ 
                    ...prev, 
                    status: e.target.checked ? 'completed' : 'pending',
                    completed: e.target.checked
                  }));
                }}
                loading={checkboxLoading[selectedTodo._id]}
              >
                Mark as {selectedTodo.status === 'completed' ? 'Incomplete' : 'Complete'}
              </Checkbox>
            </div>
            
            <Descriptions title={selectedTodo.title} bordered column={2}>
              <Descriptions.Item label="Description" span={2}>
                {selectedTodo.description || 'No description provided'}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedTodo.status)} icon={getStatusIcon(selectedTodo.status)}>
                  {(selectedTodo.status || 'pending').replace('-', ' ').toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Priority">
                <Tag color={getPriorityColor(selectedTodo.priority)}>
                  {selectedTodo.priority}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                <Tag color={getCategoryColor(selectedTodo.category)}>
                  {selectedTodo.category}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Due Date">
                {selectedTodo.dueDate ? (
                  <span style={{ color: isOverdue(selectedTodo.dueDate, selectedTodo.status) ? '#ff4d4f' : 'inherit' }}>
                    {dayjs(selectedTodo.dueDate).format('MMMM DD, YYYY HH:mm')}
                    {isOverdue(selectedTodo.dueDate, selectedTodo.status) && (
                      <Tag color="red" style={{ marginLeft: 8 }}>OVERDUE</Tag>
                    )}
                  </span>
                ) : 'No due date set'}
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {dayjs(selectedTodo.createdAt).format('MMMM DD, YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                {dayjs(selectedTodo.updatedAt).format('MMMM DD, YYYY HH:mm')}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* Edit Todo Modal */}
      <Modal
        title="Edit Todo"
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setSelectedTodo(null);
          form.resetFields();
        }}
        onOk={form.submit}
        confirmLoading={actionLoading}
        width={600}
      >
        {selectedTodo && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdateTodo}
          >
            <Form.Item
              name="title"
              label="Title"
              rules={[
                { required: true, message: 'Please enter todo title!' },
                { max: 100, message: 'Title cannot exceed 100 characters!' }
              ]}
            >
              <Input placeholder="Enter todo title" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                { max: 500, message: 'Description cannot exceed 500 characters!' }
              ]}
            >
              <TextArea
                rows={3}
                placeholder="Enter todo description"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: 'Please select status!' }]}
                >
                  <Select>
                    <Option value="pending">Pending</Option>
                    <Option value="in-progress">In Progress</Option>
                    <Option value="completed">Completed</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="priority"
                  label="Priority"
                  rules={[{ required: true, message: 'Please select priority!' }]}
                >
                  <Select>
                    <Option value="High">High</Option>
                    <Option value="Medium">Medium</Option>
                    <Option value="Low">Low</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="category"
                  label="Category"
                  rules={[{ required: true, message: 'Please select category!' }]}
                >
                  <Select>
                    <Option value="Work">Work</Option>
                    <Option value="Personal">Personal</Option>
                    <Option value="Health">Health</Option>
                    <Option value="Education">Education</Option>
                    <Option value="Shopping">Shopping</Option>
                    <Option value="Other">Other</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="dueDate"
                  label="Due Date"
                >
                  <DatePicker
                    showTime
                    format="YYYY-MM-DD HH:mm"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Modal>

      {/* Create Todo Form Modal */}
      <TodoForm
        open={todoFormOpen}
        onClose={() => {
          setTodoFormOpen(false);
        }}
        onSubmit={handleCreateTodo}
        loading={actionLoading}
      />

      <style jsx>{`
        .overdue-row {
          background-color: #fff2f0 !important;
        }
        .completed-row {
          background-color: #f6ffed !important;
          opacity: 0.8;
        }
        .completed-row td {
          color: #999 !important;
        }
      `}</style>
    </div>
  );
};

export default AllTodos;