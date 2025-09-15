import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Typography,
  Space,
  Divider
} from 'antd';
import { PlusOutlined, UserAddOutlined } from '@ant-design/icons';
import apiService from '../../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AdminTaskAssignment = () => {
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await apiService.getUsersForAssignment();
      if (response.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      message.error('Failed to fetch users');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleAssignTask = async (values) => {
    try {
      setLoading(true);
      const taskData = {
        ...values,
        dueDate: values.dueDate.toISOString(),
        userId: values.assignToUserId
      };

      const response = await apiService.assignTodoToUser(taskData);
      
      if (response.success) {
        message.success('Task assigned successfully');
        form.resetFields();
      }
    } catch (error) {
      message.error('Failed to assign task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-task-assignment">
      <Card 
        title={
          <Space>
            <UserAddOutlined />
            <Title level={4} style={{ margin: 0 }}>Assign Task to User</Title>
          </Space>
        }
        style={{ maxWidth: 600, margin: '0 auto' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAssignTask}
          initialValues={{
            priority: 'Medium',
            category: 'Work'
          }}
        >
          <Form.Item
            name="assignToUserId"
            label="Assign To User"
            rules={[{ required: true, message: 'Please select a user!' }]}
          >
            <Select
              placeholder="Select user to assign task"
              loading={usersLoading}
              showSearch
              optionFilterProp="children"
            >
              {users.map(user => (
                <Option key={user._id} value={user._id}>
                  <Space>
                    {user.username} ({user.email})
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="Task Title"
            rules={[
              { required: true, message: 'Please enter task title!' },
              { max: 100, message: 'Title cannot exceed 100 characters!' }
            ]}
          >
            <Input placeholder="Enter task title" />
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
              placeholder="Enter task description (optional)"
            />
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="Due Date"
            rules={[{ required: true, message: 'Please select due date!' }]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>

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

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<PlusOutlined />}
              size="large"
              block
            >
              Assign Task
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AdminTaskAssignment;