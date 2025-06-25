import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, 
  Tag, 
  Button, 
  Modal, 
  Descriptions, 
  message, 
  Spin, 
  Input, 
  Card, 
  Row, 
  Col,
  Statistic,
  Select,
  Form,
  Space,
  DatePicker
} from 'antd';
import { 
  MailOutlined, 
  SearchOutlined, 
  FilterOutlined,
  CloseOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [filters, setFilters] = useState({
    status: null,
    search: '',
    dateRange: null
  });
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    replied: 0,
    pending: 0
  });

  // Status configuration
  const statusConfig = {
    new: { 
      label: 'New', 
      color: 'blue',
      icon: <MailOutlined />,
      arabic: 'جديد'
    },
    pending: { 
      label: 'Pending', 
      color: 'orange',
      icon: <ClockCircleOutlined />,
      arabic: 'قيد المعالجة'
    },
    replied: { 
      label: 'Replied', 
      color: 'green',
      icon: <CheckCircleOutlined />,
      arabic: 'تم الرد'
    },
    archived: { 
      label: 'Archived', 
      color: 'gray',
      icon: <CheckOutlined />,
      arabic: 'مؤرشف'
    }
  };

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const params = {
        status: filters.status,
        search: filters.search
      };

      if (filters.dateRange) {
        params.startDate = filters.dateRange[0].format('YYYY-MM-DD');
        params.endDate = filters.dateRange[1].format('YYYY-MM-DD');
      }

      const response = await api.get('/admin/messages', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      if (response.data.success) {
        setMessages(response.data.messages);
        setStats(response.data.stats);
      }
    } catch (error) {
      message.error('Failed to fetch messages: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const viewMessageDetails = (message) => {
    setSelectedMessage(message);
    setModalVisible(true);
  };

  /*const updateMessageStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      await api.put(`/admin/messages/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Message status updated');
      fetchMessages();
    } catch (error) {
      message.error('Failed to update status: ' + (error.response?.data?.message || error.message));
    }
  };*/

  const sendReply = async () => {
    try {
      setReplyLoading(true);
      const token = localStorage.getItem('adminToken');
      
      await api.post(`/admin/messages/${selectedMessage.id}/reply`, {
        content: replyContent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      message.success('Reply sent successfully');
      setReplyModalVisible(false);
      setReplyContent('');
      fetchMessages();
    } catch (error) {
      message.error('Failed to send reply: ' + (error.response?.data?.message || error.message));
    } finally {
      setReplyLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      status: null,
      search: '',
      dateRange: null
    });
  };

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const columns = [
    {
      title: 'From',
      dataIndex: 'fullName',
      key: 'from',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-gray-500 text-sm">{record.email}</div>
        </div>
      ),
      sorter: (a, b) => a.fullName.localeCompare(b.fullName)
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      render: (text) => <span className="text-gray-700">{text}</span>
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'date',
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm'),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at)
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag 
          color={statusConfig[status]?.color} 
          icon={statusConfig[status]?.icon}
          className="flex items-center gap-1"
        >
          {statusConfig[status]?.arabic}
        </Tag>
      ),
      filters: Object.entries(statusConfig).map(([key, { arabic }]) => ({
        text: arabic,
        value: key
      })),
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button 
            size="small"
            onClick={() => viewMessageDetails(record)}
          >
            View
          </Button>
          {record.status !== 'replied' && (
            <Button 
              size="small"
              type="primary"
              onClick={() => {
                setSelectedMessage(record);
                setReplyModalVisible(true);
              }}
            >
              Reply
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Messages Management</h1>
            <p className="text-gray-600">View and respond to contact form submissions</p>
          </div>
          <Button 
            icon={<SyncOutlined />}
            onClick={fetchMessages}
            loading={loading}
          >
            Refresh
          </Button>
        </div>

        {/* Statistics */}
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Messages"
                value={stats.total}
                prefix={<MailOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="New Messages"
                value={stats.new}
                valueStyle={{ color: statusConfig.new.color }}
                prefix={statusConfig.new.icon}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Pending"
                value={stats.pending}
                valueStyle={{ color: statusConfig.pending.color }}
                prefix={statusConfig.pending.icon}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Replied"
                value={stats.replied}
                valueStyle={{ color: statusConfig.replied.color }}
                prefix={statusConfig.replied.icon}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex flex-wrap gap-4">
            <Input
              placeholder="Search messages..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full md:w-64"
            />
            
            <Select
              placeholder="Filter by status"
              allowClear
              value={filters.status}
              onChange={(value) => setFilters({...filters, status: value})}
              className="w-full md:w-48"
            >
              {Object.entries(statusConfig).map(([key, { arabic }]) => (
                <Option key={key} value={key}>{arabic}</Option>
              ))}
            </Select>
            
            <RangePicker
              placeholder={['Start Date', 'End Date']}
              value={filters.dateRange}
              onChange={(dates) => setFilters({...filters, dateRange: dates})}
              className="w-full md:w-64"
            />
            
            <Button
              icon={<FilterOutlined />}
              onClick={fetchMessages}
            >
              Apply
            </Button>
            
            <Button
              icon={<CloseOutlined />}
              onClick={resetFilters}
            >
              Reset
            </Button>
          </div>
        </Card>

        {/* Messages Table */}
        <Card title="Messages List">
          <Table
            columns={columns}
            dataSource={messages}
            rowKey="id"
            loading={loading}
            pagination={{ 
              pageSize: 10, 
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} messages`
            }}
            scroll={{ x: true }}
          />
        </Card>

        {/* Message Details Modal */}
        <Modal
          title="Message Details"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={800}
        >
          {selectedMessage ? (
            <Descriptions bordered column={1}>
              <Descriptions.Item label="From">
                <div>
                  <div className="font-medium">{selectedMessage.fullName}</div>
                  <div className="text-gray-500">{selectedMessage.email}</div>
                  <div className="text-gray-500">{selectedMessage.phone}</div>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Subject">{selectedMessage.subject}</Descriptions.Item>
              <Descriptions.Item label="Inquiry Type">
                <Tag>{selectedMessage.inquiryType}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Date">
                {moment(selectedMessage.created_at).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag 
                  color={statusConfig[selectedMessage.status]?.color}
                  icon={statusConfig[selectedMessage.status]?.icon}
                >
                  {statusConfig[selectedMessage.status]?.arabic}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="IP Address">
                <code>{selectedMessage.ip_address || 'Unknown'}</code>
              </Descriptions.Item>
              <Descriptions.Item label="Message">
                <div className="bg-gray-50 p-4 rounded">
                  {selectedMessage.message}
                </div>
              </Descriptions.Item>
              {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                <Descriptions.Item label="Replies">
                  <div className="space-y-4">
                    {selectedMessage.replies.map((reply, index) => (
                      <div key={index} className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                        <div className="font-medium">Admin Reply</div>
                        <div className="text-gray-500 text-sm">
                          {moment(reply.created_at).format('YYYY-MM-DD HH:mm')}
                        </div>
                        <div className="mt-2">{reply.content}</div>
                      </div>
                    ))}
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>
          ) : (
            <Spin size="large" />
          )}
        </Modal>

        {/* Reply Modal */}
        <Modal
          title={`Reply to ${selectedMessage?.fullName || 'message'}`}
          open={replyModalVisible}
          onOk={sendReply}
          onCancel={() => {
            setReplyModalVisible(false);
            setReplyContent('');
          }}
          confirmLoading={replyLoading}
          okText="Send Reply"
          cancelText="Cancel"
          width={600}
        >
          <Form layout="vertical">
            <Form.Item label="Original Message">
              <div className="bg-gray-50 p-3 rounded">
                {selectedMessage?.message}
              </div>
            </Form.Item>
            <Form.Item label="Your Reply" required>
              <TextArea
                rows={6}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your response here..."
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default AdminMessages;