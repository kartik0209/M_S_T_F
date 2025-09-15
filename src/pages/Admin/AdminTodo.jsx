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
  Col,
  Modal,
  Form,
  DatePicker,
  Descriptions,
  Divider,
  Dropdown
} from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
  MoreOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import apiService from '../../services/api';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

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

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [form] = Form.useForm();
const [viewType, setViewType] = useState("table"); // "table" | "board"

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
      console.error('Fetch todos error:', error);
    } finally {
      setLoading(false);
    }
  };


const handleDragEnd = async (result) => {
  const { source, destination, draggableId } = result;
  if (!destination) return;

  const newStatus = destination.droppableId;
  const oldStatus = source.droppableId;

  // If the status didn't change, just reorder the items within the same list
  if (newStatus === oldStatus) {
    const items = Array.from(todos);
    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);
    setTodos(items);
    return;
  }

  // Filter the tasks to get the source list
  const sourceTodos = todos.filter(todo => (todo.status || 'pending') === oldStatus);

  // Get the dragged todo and remove it from the source list
  const draggedTodo = sourceTodos.find(todo => todo._id === draggableId);
  if (!draggedTodo) return;
  
  const newTodos = [...todos];
  const draggedTodoIndex = newTodos.findIndex(todo => todo._id === draggableId);
  
  // Update the status of the dragged todo
  newTodos[draggedTodoIndex] = { ...newTodos[draggedTodoIndex], status: newStatus };
  
  // Optimistically update the state for a smooth UI
  setTodos(newTodos);

  // Call the API to update the status on the backend
  const success = await onStatusChange(draggableId, { status: newStatus });
  
  // If API call fails, revert the state
  if (!success) {
    setTodos(todos); // Revert to the original state
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
      userId: ''
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
    <DragDropContext onDragEnd={handleDragEnd}>
      <Row gutter={16} style={{ marginTop: 16 }}>
        {statuses.map((status) => (
          <Col span={8} key={status}>
            <Droppable droppableId={status}>
              {(provided, snapshot) => (
                <Card
                  title={status.replace("-", " ").toUpperCase()}
                  bordered
                  style={{
                    minHeight: "70vh",
                    background: snapshot.isDraggingOver ? "#f0f5ff" : "white",
                  }}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {todos
                    .filter((todo) => (todo.status || "pending") === status)
                    .map((todo, index) => (
                      <Draggable
                        key={todo._id}
                        draggableId={todo._id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Card
                            size="small"
                            style={{
                              marginBottom: 12,
                              borderRadius: 8,
                              background: snapshot.isDragging
                                ? "#e6f7ff"
                                : "white",
                            }}
                            actions={[
                              <EyeOutlined key="view" onClick={() => handleViewTodo(todo)} />,
                              <EditOutlined key="edit" onClick={() => handleEditTodo(todo)} />,
                              <DeleteOutlined
                                key="delete"
                                onClick={() => handleDeleteTodo(todo._id, todo.title)}
                              />,
                            ]}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <Card.Meta
                              avatar={
                                <Avatar
                                  src={todo.userId?.profileImage}
                                  icon={<UserOutlined />}
                                />
                              }
                              title={
                                <div>
                                  {todo.title}
                                  {isOverdue(todo.dueDate, todo.status) && (
                                    <Tag color="red" style={{ marginLeft: 8 }}>
                                      OVERDUE
                                    </Tag>
                                  )}
                                </div>
                              }
                              description={
                                <div>
                                  <Tag color={getPriorityColor(todo.priority)}>
                                    {todo.priority}
                                  </Tag>
                                  <Tag color={getCategoryColor(todo.category)}>
                                    {todo.category}
                                  </Tag>
                                  <div style={{ fontSize: 12, marginTop: 4 }}>
                                    Due: {dayjs(todo.dueDate).format("MMM DD, YYYY")}
                                  </div>
                                </div>
                              }
                            />
                          </Card>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </Card>
              )}
            </Droppable>
          </Col>
        ))}
      </Row>
    </DragDropContext>
  );
};


  return (
    <div className="admin-todos">
      <Title level={2}>All Todos</Title>

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

      {/* Todos Table */}
   {viewType === "table" ? (
  <Card>
    <Table
      columns={columns}
      dataSource={todos}
      rowKey="_id"
      loading={loading}
      pagination={false}
      scroll={{ x: 1000 }}
      rowClassName={(record) => 
        isOverdue(record.dueDate, record.status) ? "overdue-row" : ""
      }
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
                <span style={{ color: isOverdue(selectedTodo.dueDate, selectedTodo.status) ? '#ff4d4f' : 'inherit' }}>
                  {dayjs(selectedTodo.dueDate).format('MMMM DD, YYYY HH:mm')}
                  {isOverdue(selectedTodo.dueDate, selectedTodo.status) && (
                    <Tag color="red" style={{ marginLeft: 8 }}>OVERDUE</Tag>
                  )}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Assigned To">
                <Space>
                  <Avatar src={selectedTodo.userId?.profileImage} icon={<UserOutlined />} size="small" />
                  <div>
                    <div>{selectedTodo.userId?.username}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{selectedTodo.userId?.email}</div>
                  </div>
                </Space>
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
          <div>
            <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
              <Space>
                <Avatar src={selectedTodo.userId?.profileImage} icon={<UserOutlined />} />
                <div>
                  <Text strong>Assigned to: {selectedTodo.userId?.username}</Text>
                  <div style={{ fontSize: '12px', color: '#666' }}>{selectedTodo.userId?.email}</div>
                </div>
              </Space>
            </div>

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
          </div>
        )}
      </Modal>

      <style jsx>{`
        .overdue-row {
          background-color: #fff2f0 !important;
        }
      `}</style>
    </div>
  );
};




export default AdminTodos;