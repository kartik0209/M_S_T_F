import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, message } from 'antd';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

const TodoForm = ({ 
  open, 
  onClose, 
  onSubmit, 
  todo = null, 
  loading = false 
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (todo) {
      form.setFieldsValue({
        title: todo.title,
        description: todo.description,
        category: todo.category,
        priority: todo.priority,
        status: todo.status,
        dueDate: todo.dueDate ? dayjs(todo.dueDate) : null
      });
    } else {
      form.resetFields();
    }
  }, [todo, form, open]);

  const handleSubmit = async (values) => {
    try {
      const formattedValues = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.toISOString() : null
      };
      
      await onSubmit(formattedValues);
      form.resetFields();
      onClose();
    } catch (error) {
      message.error('Failed to save todo');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={todo ? 'Edit Todo' : 'Add New Todo'}
      open={open}
      onCancel={handleCancel}
      onOk={form.submit}
      confirmLoading={loading}
      destroyOnClose
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="title"
          label="Title"
          rules={[
            { required: true, message: 'Please enter todo title!' },
            { max: 200, message: 'Title cannot exceed 200 characters!' }
          ]}
        >
          <Input 
            placeholder="Enter todo title"
            maxLength={200}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[
            { max: 1000, message: 'Description cannot exceed 1000 characters!' }
          ]}
        >
          <TextArea 
            placeholder="Enter todo description (optional)"
            rows={4}
            maxLength={1000}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="dueDate"
          label="Due Date"
          rules={[
            { required: true, message: 'Please select due date!' }
          ]}
        >
          <DatePicker 
            showTime={{ format: 'HH:mm' }}
            format="YYYY-MM-DD HH:mm"
            placeholder="Select due date and time"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="category"
          label="Category"
          rules={[
            { required: true, message: 'Please select a category!' }
          ]}
        >
          <Select placeholder="Select category">
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
          rules={[
            { required: true, message: 'Please select priority!' }
          ]}
        >
          <Select placeholder="Select priority">
            <Option value="Low">Low</Option>
            <Option value="Medium">Medium</Option>
            <Option value="High">High</Option>
          </Select>
        </Form.Item>

        {todo && (
          <Form.Item
            name="status"
            label="Status"
            rules={[
              { required: true, message: 'Please select status!' }
            ]}
          >
            <Select placeholder="Select status">
              <Option value="pending">Pending</Option>
              <Option value="in-progress">In Progress</Option>
              <Option value="completed">Completed</Option>
            </Select>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default TodoForm;