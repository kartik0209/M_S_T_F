import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Upload,
  message,
  Row,
  Col,
  Typography,
  Divider,
  Statistic,
  Tag,
  Space
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  UploadOutlined,
  EditOutlined,
  SaveOutlined,
  CameraOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import './Profile.scss';

const { Title, Text } = Typography;

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [userStats, setUserStats] = useState(null);

  React.useEffect(() => {
    if (user) {
      form.setFieldsValue({
        username: user.username,
        email: user.email
      });
      fetchUserStats();
    }
  }, [user, form]);

  const fetchUserStats = async () => {
    try {
      const response = await apiService.getUserStats();
      if (response.success) {
        setUserStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  const handleUpdateProfile = async (values) => {
    try {
      setLoading(true);
      const response = await apiService.updateProfile(values);
      
      if (response.success) {
        message.success('Profile updated successfully');
        updateUser(response.data.user);
        setEditing(false);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      setImageLoading(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await apiService.uploadProfileImage(formData);
      
      if (response.success) {
        message.success('Profile image updated successfully');
        updateUser(response.data.user);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to upload image';
      message.error(errorMessage);
    } finally {
      setImageLoading(false);
    }
    
    return false; // Prevent default upload behavior
  };

  const uploadProps = {
    accept: 'image/*',
    beforeUpload: handleImageUpload,
    showUploadList: false,
  };

  const getRoleColor = (role) => {
    return role === 'admin' ? 'red' : 'blue';
  };

  const completionRate = userStats?.summary?.total > 0 
    ? Math.round((userStats.summary.completed / userStats.summary.total) * 100) 
    : 0;

  return (
    <div className="profile-page">
      <Title level={2}>Profile Settings</Title>

      <Row gutter={[24, 24]}>
        {/* Profile Information */}
        <Col xs={24} lg={12}>
          <Card
            title="Profile Information"
            extra={
              <Button
                type={editing ? 'default' : 'primary'}
                icon={editing ? <SaveOutlined /> : <EditOutlined />}
                onClick={() => {
                  if (editing) {
                    form.submit();
                  } else {
                    setEditing(true);
                  }
                }}
                loading={loading}
              >
                {editing ? 'Save' : 'Edit'}
              </Button>
            }
          >
            {/* Avatar Section */}
            <div className="avatar-section">
              <div className="avatar-container">
                <Avatar
                  size={100}
                  src={user?.profileImage}
                  icon={<UserOutlined />}
                />
                <Upload {...uploadProps}>
                  <Button
                    className="avatar-upload-btn"
                    icon={<CameraOutlined />}
                    loading={imageLoading}
                    size="small"
                  >
                    {imageLoading ? 'Uploading...' : 'Change'}
                  </Button>
                </Upload>
              </div>
              <div className="user-basic-info">
                <Title level={4} style={{ margin: 0 }}>
                  {user?.username}
                </Title>
                <Text type="secondary">{user?.email}</Text>
                <div style={{ marginTop: 8 }}>
                  <Tag color={getRoleColor(user?.role)}>
                    {user?.role?.toUpperCase()}
                  </Tag>
                </div>
              </div>
            </div>

            <Divider />

            {/* Profile Form */}
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdateProfile}
              disabled={!editing}
            >
              <Form.Item
                name="username"
                label="Username"
                rules={[
                  { required: true, message: 'Please enter your username!' },
                  { min: 3, message: 'Username must be at least 3 characters!' },
                  { max: 50, message: 'Username cannot exceed 50 characters!' }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Enter username"
                />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter your email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Enter email"
                />
              </Form.Item>

              {editing && (
                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                    >
                      Save Changes
                    </Button>
                    <Button
                      onClick={() => {
                        setEditing(false);
                        form.setFieldsValue({
                          username: user.username,
                          email: user.email
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </Space>
                </Form.Item>
              )}
            </Form>

            <Divider />

            {/* Account Info */}
            <div className="account-info">
              <Title level={5}>Account Information</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>Member Since:</Text>
                  <div>
                    <Text type="secondary">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <Text strong>Last Login:</Text>
                  <div>
                    <Text type="secondary">
                      {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
                    </Text>
                  </div>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>

        {/* User Statistics */}
        <Col xs={24} lg={12}>
          <Card title="Your Statistics">
            {userStats ? (
              <>
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={12}>
                    <Statistic
                      title="Total Todos"
                      value={userStats.summary.total}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Completed"
                      value={userStats.summary.completed}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                </Row>

                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={12}>
                    <Statistic
                      title="Pending"
                      value={userStats.summary.pending}
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Overdue"
                      value={userStats.summary.overdue}
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                  </Col>
                </Row>

                <Divider />

                <div style={{ marginBottom: 16 }}>
                  <Text strong>Completion Rate</Text>
                  <div style={{ marginTop: 8 }}>
                    <div className="completion-rate">
                      <div 
                        className="completion-bar" 
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {completionRate}% completed
                    </Text>
                  </div>
                </div>

                <Divider />

                {/* Category Breakdown */}
                {userStats.categoryStats && userStats.categoryStats.length > 0 && (
                  <div>
                    <Text strong>Categories</Text>
                    <div style={{ marginTop: 12 }}>
                      {userStats.categoryStats.slice(0, 5).map((category, index) => (
                        <div key={index} className="category-item">
                          <span>{category._id}</span>
                          <Tag>{category.count}</Tag>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Priority Breakdown */}
                {userStats.priorityStats && userStats.priorityStats.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <Text strong>Priority Distribution</Text>
                    <div style={{ marginTop: 12 }}>
                      {userStats.priorityStats.map((priority, index) => (
                        <div key={index} className="priority-item">
                          <span>{priority._id}</span>
                          <Tag 
                            color={
                              priority._id === 'High' ? 'red' : 
                              priority._id === 'Medium' ? 'orange' : 'green'
                            }
                          >
                            {priority.count}
                          </Tag>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="loading-stats">
                <Text type="secondary">Loading statistics...</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;