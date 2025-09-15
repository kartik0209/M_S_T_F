import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Input,
  Select,
  Row,
  Col,
  message,
  Spin,
  Typography,
  Space,
  Pagination,
  Switch,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  AppstoreOutlined,
  BarsOutlined,
} from "@ant-design/icons";
import apiService from "../../services/api";
import TodoForm from "../../components/Todo/TodoForm";
import TodoList from "../../components/Todo/TodoList";

const { Title } = Typography;
const { Option } = Select;

const AllTodos = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todoFormOpen, setTodoFormOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isKanban, setIsKanban] = useState(false); // ✅ toggle view

  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    pageSize: 20,
  });

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    category: "",
    priority: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const statuses = ["pending", "in-progress", "completed"];

  useEffect(() => {
    fetchTodos();
  }, [pagination.current, filters]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
      };

      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      const response = await apiService.getTodos(params);

      if (response.success) {
        setTodos(response.data.todos);
        setPagination((prev) => ({
          ...prev,
          total: response.data.pagination.total,
        }));
      }
    } catch (error) {
      message.error("Failed to fetch todos");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTodo = async (todoData) => {
    try {
      setActionLoading(true);
      const response = await apiService.createTodo(todoData);
      if (response.success) {
        message.success("Todo created successfully");
        fetchTodos();
      }
    } catch (error) {
      message.error("Failed to create todo");
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
        message.success("Todo updated successfully");
        fetchTodos();
        setSelectedTodo(null);
      }
    } catch (error) {
      message.error("Failed to update todo");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTodo = async (todoId) => {
    try {
      setActionLoading(true);
      const response = await apiService.deleteTodo(todoId);
      if (response.success) {
        message.success("Todo deleted successfully");
        fetchTodos();
      }
    } catch (error) {
      message.error("Failed to delete todo");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (todoId, updateData) => {
    try {
      setActionLoading(true);
      const response = await apiService.updateTodo(todoId, updateData);
      if (response.success) {
        message.success("Todo status updated");
        fetchTodos();
      }
    } catch (error) {
      message.error("Failed to update todo status");
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ Drag-and-drop handlers
  const onDragStart = (e, id) => {
    e.dataTransfer.setData("todoId", id);
  };

  const allowDrop = (e) => {
    e.preventDefault();
  };

  const onDrop = (e, newStatus) => {
    e.preventDefault();
    const todoId = e.dataTransfer.getData("todoId");
    handleStatusChange(todoId, { status: newStatus });
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handlePageChange = (page, pageSize) => {
    setPagination((prev) => ({ ...prev, current: page, pageSize }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      category: "",
      priority: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  return (
    <div className="todos-page">
      <div className="page-header">
        <Title level={2}>All Todos</Title>
        <Space>
          <Switch
            checkedChildren={<AppstoreOutlined />}
            unCheckedChildren={<BarsOutlined />}
            checked={isKanban}
            onChange={setIsKanban}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setTodoFormOpen(true)}
            size="large"
          >
            Add Todo
          </Button>
        </Space>
      </div>

      {/* Filters */}
      <Card className="filters-card" bodyStyle={{ padding: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Input.Search
              placeholder="Search todos..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              onSearch={() => fetchTodos()}
              allowClear
              enterButton
            />
          </Col>

          <Col xs={12} sm={4} md={3}>
            <Select
              placeholder="Status"
              value={filters.status}
              onChange={(value) => handleFilterChange("status", value)}
              allowClear
              style={{ width: "100%" }}
            >
              <Option value="pending">Pending</Option>
              <Option value="in-progress">In Progress</Option>
              <Option value="completed">Completed</Option>
            </Select>
          </Col>

          <Col xs={12} sm={4} md={3}>
            <Button onClick={clearFilters}>Clear</Button>
          </Col>
        </Row>
      </Card>

      {/* Todo Display */}
      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : isKanban ? (
        // ✅ Kanban Board
        <Row gutter={16} style={{ marginTop: 20 }}>
          {statuses.map((status) => (
            <Col span={8} key={status}>
              <Card
                title={status.toUpperCase()}
                onDragOver={allowDrop}
                onDrop={(e) => onDrop(e, status)}
                style={{ minHeight: "300px", background: "#fafafa" }}
              >
                {todos
                  .filter((todo) => todo.status === status)
                  .map((todo) => (
                    <Card
                      key={todo._id}
                      draggable
                      onDragStart={(e) => onDragStart(e, todo._id)}
                      style={{ marginBottom: 10, cursor: "grab" }}
                      onDoubleClick={() => handleEditTodo(todo)}
                    >
                      <b>{todo.title}</b>
                      <p>{todo.description}</p>
                      <Button
                        danger
                        size="small"
                        onClick={() => handleDeleteTodo(todo._id)}
                      >
                        Delete
                      </Button>
                    </Card>
                  ))}
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        // ✅ List/Table View
        <TodoList
          todos={todos}
          onEdit={handleEditTodo}
          onDelete={handleDeleteTodo}
          onStatusChange={handleStatusChange}
          loading={actionLoading}
        />
      )}

      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="pagination-container">
          <Pagination
            current={pagination.current}
            total={pagination.total}
            pageSize={pagination.pageSize}
            onChange={handlePageChange}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} todos`}
          />
        </div>
      )}

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

export default AllTodos;
