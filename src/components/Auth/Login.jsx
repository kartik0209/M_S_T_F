import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Divider, Spin } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.scss';

const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const { login, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onFinish = async (values) => {
    setIsSubmitting(true);
    await login(values);
    setIsSubmitting(false);
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <Title level={2}>Welcome Back</Title>
          <Text type="secondary">Sign in to your account</Text>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              disabled={isSubmitting || loading}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              disabled={isSubmitting || loading}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting || loading}
              block
            >
              {isSubmitting || loading ? <Spin size="small" /> : 'Sign In'}
            </Button>
          </Form.Item>
        </Form>

        <Divider>Or</Divider>

        <div className="auth-footer">
          <Text>Don't have an account? </Text>
          <Link to="/register">Sign up</Link>
        </div>

        <div className="demo-credentials">
          <Divider>Demo Credentials</Divider>
          <div className="demo-section">
            <Text strong>Admin:</Text>
            <Text>admin@example.com / admin123</Text>
          </div>
          <div className="demo-section">
            <Text strong>User:</Text>
            <Text>user@example.com / user123</Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;