import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Space,
  Avatar,
  Spin
} from 'antd';
import { PlusOutlined, UserAddOutlined, UserOutlined } from '@ant-design/icons';
import apiService from '../../services/api';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

const AdminTaskAssignment = ({ visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      fetchUsers();
    }
  }, [visible]);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await apiService.getUsers(); // Use your existing method
      if (response.success) {
        // Filter out admin users, only show regular users
        const regularUsers = response.data.users.filter(user => user.role !== 'admin');
        setUsers(regularUsers);
      }
    } catch (error) {
      message.error('Failed to fetch users');
      console.error('Fetch users error:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleAssignTask = async (values) => {
    try {
      setLoading(true);
      const taskData = {
        title: values.title,
        description: values.description || '',
        dueDate: values.dueDate.toISOString(),
        category: values.category,
        priority: values.priority,
        userId: values.assignToUserId, // User to assign task to
      };

      const response = await apiService.assignTodoToUser(taskData);
      
      if (response.success) {
        message.success('Task assigned successfully');
        form.resetFields();
        onSuccess(); // Call success callback
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to assign task');
      console.error('Assign task error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          <UserAddOutlined />
          <span>Assign Task to User</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
          icon={<PlusOutlined />}
        >
          Assign Task
        </Button>
      ]}
      width={600}
      destroyOnClose
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
            notFoundContent={usersLoading ? <Spin size="small" /> : 'No users found'}
            filterOption={(input, option) =>
              option.children.props.children[1].props.children[0].props.children
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0
            }
          >
            {users.map(user => (
              <Option key={user._id} value={user._id}>
                <Space>
                  <Avatar 
                    src={user.profileImage} 
                    icon={<UserOutlined />} 
                    size="small" 
                  />
                  <div>
                    <div>{user.username}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {user.email}
                    </div>
                  </div>
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
      </Form>
    </Modal>
  );
};

export default AdminTaskAssignment;