import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Table, 
  Statistic, 
  Row, 
  Col, 
  Button, 
  Input, 
  DatePicker,
  Select,
  Spin,
  message,
  Modal,
  Descriptions
} from 'antd';
import { 
  StarFilled, 
  StarOutlined, 
  DownloadOutlined, 
  SearchOutlined,
  FilterOutlined,
  CloseOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { RangePicker } = DatePicker;
const { Option } = Select;

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const AdminRatings = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    average: 0,
    total: 0,
    starCounts: [0, 0, 0, 0, 0]
  });
  const [filters, setFilters] = useState({
    rating: null,
    dateRange: null,
    search: ''
  });
  const [selectedRating, setSelectedRating] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchRatings = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      // Build query params
      const params = {};
      if (filters.rating) params.rating = filters.rating;
      if (filters.dateRange) {
        params.startDate = filters.dateRange[0].toISOString().split('T')[0];
        params.endDate = filters.dateRange[1].toISOString().split('T')[0];
      }
      if (filters.search) params.search = filters.search;

      const response = await api.get('/admin/ratings', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      if (response.data?.success) {
        setRatings(response.data.ratings);
        setStats(response.data.stats);
      }
    } catch (error) {
      message.error('Failed to fetch ratings: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const viewRatingDetails = (rating) => {
    setSelectedRating(rating);
    setModalOpen(true);
  };

  const exportRatings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.get('/admin/ratings/export', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `employee_ratings_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      message.error('Failed to export ratings: ' + (error.response?.data?.message || error.message));
    }
  };

  const resetFilters = () => {
    setFilters({
      rating: null,
      dateRange: null,
      search: ''
    });
  };

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) =>
          star <= rating ? (
            <StarFilled key={star} className="text-yellow-400" />
          ) : (
            <StarOutlined key={star} className="text-gray-300" />
          )
        )}
        <span className="ml-1 text-gray-600">({rating})</span>
      </div>
    );
  };

  const columns = [
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => renderStars(rating),
      sorter: (a, b) => a.rating - b.rating,
    },
    {
      title: 'Comment',
      dataIndex: 'comment',
      key: 'comment',
      render: (text) => text || <span className="text-gray-400">No comment</span>,
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'date',
      render: (date) => formatDate(date),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: 'IP Address',
      dataIndex: 'ip_address',
      key: 'ip',
      render: (ip) => ip || <span className="text-gray-400">Unknown</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="link" 
          onClick={() => viewRatingDetails(record)}
          className="p-0"
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Employee Ratings Dashboard</h1>
            <p className="text-gray-600">Manage and analyze employee feedback</p>
          </div>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={exportRatings}
            className="flex items-center"
          >
            Export Data
          </Button>
        </div>

        {/* Filters Section */}
        <Card className="mb-6" bordered={false}>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Comments</label>
              <Input
                placeholder="Search feedback..."
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                allowClear
              />
            </div>
            
            <div className="w-[180px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Rating</label>
              <Select
                placeholder="All Ratings"
                allowClear
                value={filters.rating}
                onChange={(value) => setFilters({...filters, rating: value})}
                className="w-full"
              >
                <Option value="5">5 Stars</Option>
                <Option value="4">4 Stars</Option>
                <Option value="3">3 Stars</Option>
                <Option value="2">2 Stars</Option>
                <Option value="1">1 Star</Option>
              </Select>
            </div>
            
            <div className="w-[250px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <RangePicker
                className="w-full"
                value={filters.dateRange}
                onChange={(dates) => setFilters({...filters, dateRange: dates})}
              />
            </div>
            
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={fetchRatings}
              className="h-[32px]"
            >
              Apply
            </Button>
            
            <Button
              icon={<CloseOutlined />}
              onClick={resetFilters}
              className="h-[32px]"
            >
              Reset
            </Button>
          </div>
        </Card>

        {/* Statistics Cards */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Average Rating"
                value={stats.average.toFixed(1)}
                precision={1}
                prefix={<StarFilled className="text-yellow-400" />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Ratings"
                value={stats.total}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Rating Distribution">
              <div className="flex flex-wrap justify-between gap-4">
                {stats.starCounts.map((count, index) => (
                  <div key={index} className="text-center min-w-[60px]">
                    <div className="text-lg font-semibold">{count}</div>
                    <div className="flex justify-center">
                      {renderStars(5 - index)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {stats.total > 0 ? `${Math.round((count / stats.total) * 100)}%` : '0%'}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Ratings Table */}
        <Card 
          title={<span className="text-lg font-semibold">Employee Feedback</span>}
          bordered={false}
          extra={
            <Button 
              onClick={fetchRatings}
              loading={loading}
              icon={<SearchOutlined />}
            >
              Refresh
            </Button>
          }
        >
          <Table
            columns={columns}
            dataSource={ratings}
            rowKey="id"
            loading={loading}
            pagination={{ 
              pageSize: 10, 
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} ratings`,
              pageSizeOptions: ['10', '25', '50', '100']
            }}
            scroll={{ x: true }}
            className="custom-table"
          />
        </Card>

        {/* Rating Details Modal */}
        <Modal
          title={<span className="text-xl font-semibold">Rating Details</span>}
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          footer={null}
          width={700}
        >
          {selectedRating ? (
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="Rating">
                <div className="flex items-center">
                  {renderStars(selectedRating.rating)}
                  <span className="ml-2 text-gray-600">
                    {selectedRating.rating} out of 5
                  </span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Comment">
                {selectedRating.comment ? (
                  <div className="bg-gray-50 p-3 rounded">{selectedRating.comment}</div>
                ) : (
                  <span className="text-gray-400">No comment provided</span>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Date Submitted">
                {formatDate(selectedRating.created_at)}
              </Descriptions.Item>
              <Descriptions.Item label="IP Address">
                <code>{selectedRating.ip_address || 'Not available'}</code>
              </Descriptions.Item>
              <Descriptions.Item label="Device Info">
                {selectedRating.user_agent ? (
                  <div className="text-sm text-gray-600">{selectedRating.user_agent}</div>
                ) : (
                  <span className="text-gray-400">Not available</span>
                )}
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <div className="flex justify-center p-8">
              <Spin size="large" />
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AdminRatings;