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
        ...todo,
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
        dueDate: values.dueDate.toISOString()
      };
      await onSubmit(formattedValues);
      form.resetFields();
      onClose();
    } catch (error) {
      message.error('Failed to save todo');
    }
  };

  return (
    <Modal
      title={todo ? 'Edit Todo' : 'Add New Todo'}
      open={open}
      onCancel={onClose}
      onOk={form.submit}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
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
         