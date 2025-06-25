import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, Tag, Button, Modal, Descriptions, 
  message, Spin, Input, Card, Row, Col,
  Statistic, Popconfirm, Space 
} from 'antd';
import { 
  CheckOutlined, CloseOutlined, EyeOutlined, 
  CheckCircleOutlined, ClockCircleOutlined,
  ExclamationCircleOutlined, TruckOutlined
} from '@ant-design/icons';
import axios from 'axios';
import './AdminOrder.css';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

const statusConfig = {
  pending: { 
    label: 'Pending', 
    color: 'orange',
    arabic: 'قيد المعالجة',
    icon: <ClockCircleOutlined />
  },
  approved: { 
    label: 'Approved', 
    color: 'green',
    arabic: 'تم الموافقة',
    icon: <CheckCircleOutlined />
  },
  rejected: { 
    label: 'Rejected', 
    color: 'red',
    arabic: 'تم الرفض',
    icon: <ExclamationCircleOutlined />
  },
  fulfilled: { 
    label: 'Fulfilled', 
    color: 'blue',
    arabic: 'تم التسليم',
    icon: <TruckOutlined />
  }
};

const AdminOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    fulfilled: 0
  });

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('Authentication required');

      const response = await api.get('/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        const mappedOrders = response.data.orders.map(order => {
          const statusKey = Object.keys(statusConfig).find(
            key => statusConfig[key].arabic === order.status
          ) || order.status;
          
          return {
            ...order,
            status: statusKey,
            formattedDate: new Date(order.order_date).toLocaleString()
          };
        });

        const stats = {
          pending: mappedOrders.filter(o => o.status === 'pending').length,
          approved: mappedOrders.filter(o => o.status === 'approved').length,
          rejected: mappedOrders.filter(o => o.status === 'rejected').length,
          fulfilled: mappedOrders.filter(o => o.status === 'fulfilled').length
        };
        
        setOrders(mappedOrders);
        setStats(stats);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const viewOrderDetails = async (orderId) => {
    try {
      setOrderLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await api.get(`/admin/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        const statusKey = Object.keys(statusConfig).find(
          key => statusConfig[key].arabic === response.data.order.status
        ) || response.data.order.status;

        setSelectedOrder({
          ...response.data,
          order: {
            ...response.data.order,
            status: statusKey,
            formattedDate: new Date(response.data.order.order_date).toLocaleString()
          }
        });
        setModalOpen(true);
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setOrderLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status, reason = '') => {
    try {
      const token = localStorage.getItem('adminToken');
      const arabicStatus = statusConfig[status]?.arabic || status;
      
      const response = await api.put(
        `/admin/orders/${orderId}/status`,
        { 
          status: arabicStatus,
          rejectionReason: status === 'rejected' ? reason : null
        },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      if (response.data?.success) {
        message.success(`Order #${response.data.order.order_number} status updated to ${statusConfig[status].label}`);
        fetchOrders();
        setRejectModalOpen(false);
        setRejectionReason('');
        setModalOpen(false);
      }
    } catch (error) {
      message.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const columns = [
    {
      title: 'Order #',
      dataIndex: 'order_number',
      key: 'order_number',
      sorter: (a, b) => a.order_number.localeCompare(b.order_number),
      render: (text) => <strong>#{text}</strong>
    },
    {
      title: 'Employee',
      dataIndex: 'requested_by_name',
      key: 'employee',
      render: (text) => <span className="text-gray-700">{text}</span>
    },
    {
      title: 'Date',
      dataIndex: 'order_date',
      key: 'date',
      render: (date) => <span className="text-gray-500">{new Date(date).toLocaleString()}</span>,
      sorter: (a, b) => new Date(a.order_date) - new Date(b.order_date)
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
          {statusConfig[status]?.label}
        </Tag>
      ),
      filters: Object.entries(statusConfig).map(([key, { label }]) => ({
        text: label,
        value: key
      })),
      onFilter: (value, record) => record.status === value,
      filterMultiple: true
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button 
            icon={<EyeOutlined />}
            onClick={() => viewOrderDetails(record.id)}
            className="flex items-center"
          >
            Details
          </Button>
          
          {record.status === 'pending' && (
            <>
              <Popconfirm
                title="Approve this order?"
                onConfirm={() => updateOrderStatus(record.id, 'approved')}
                okText="Yes"
                cancelText="No"
              >
                <Button 
                  type="primary" 
                  icon={<CheckOutlined />}
                  className="flex items-center"
                >
                  Approve
                </Button>
              </Popconfirm>
              
              <Button 
                danger 
                icon={<CloseOutlined />}
                onClick={() => {
                  setCurrentOrderId(record.id);
                  setRejectModalOpen(true);
                }}
                className="flex items-center"
              >
                Reject
              </Button>
            </>
          )}
          
          {record.status === 'approved' && (
            <Button 
              type="dashed"
              icon={<TruckOutlined />}
              onClick={() => updateOrderStatus(record.id, 'fulfilled')}
              className="flex items-center"
            >
              Fulfill
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="admin-order-container">
      <div className="admin-order-content">
        <h1 className="admin-order-title">Order Management Dashboard</h1>
        
        <Row gutter={16} className="statistics-row">
          <Col span={6}>
            <Card className="statistics-card">
              <Statistic
                title="Pending Orders"
                value={stats.pending}
                prefix={<ClockCircleOutlined className="text-orange-500" />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="statistics-card">
              <Statistic
                title="Approved Orders"
                value={stats.approved}
                prefix={<CheckCircleOutlined className="text-green-500" />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="statistics-card">
              <Statistic
                title="Rejected Orders"
                value={stats.rejected}
                prefix={<ExclamationCircleOutlined className="text-red-500" />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="statistics-card">
              <Statistic
                title="Fulfilled Orders"
                value={stats.fulfilled}
                prefix={<TruckOutlined className="text-blue-500" />}
              />
            </Card>
          </Col>
        </Row>

        <Modal
          title={<span className="text-xl font-semibold">Order Rejection</span>}
          open={rejectModalOpen}
          onOk={() => {
            if (!rejectionReason.trim()) {
              message.error('Please enter a rejection reason');
              return;
            }
            updateOrderStatus(currentOrderId, 'rejected', rejectionReason);
          }}
          onCancel={() => {
            setRejectModalOpen(false);
            setRejectionReason('');
          }}
          okText="Confirm Rejection"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
          width={600}
        >
          <div className="mb-4">
            <p className="text-gray-600 mb-2">Please provide the reason for rejecting this order:</p>
            <Input.TextArea
              rows={4}
              placeholder="Example: Missing required documentation, insufficient quantity available, etc."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="border-gray-300 hover:border-blue-500"
            />
          </div>
        </Modal>

        <Modal
          title={<span className="order-details-modal-title">Order Details #{selectedOrder?.order?.order_number || ''}</span>}
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          footer={null}
          width={900}
          styles={{
            body: { padding: '24px' }
          }}
          className="order-details-modal"
        >
          {orderLoading ? (
            <div className="flex justify-center p-8">
              <Spin size="large" />
            </div>
          ) : selectedOrder ? (
            <div className="space-y-6">
              <Card title="Order Information" variant="borderless" className="order-details-card">
                <Descriptions bordered column={1} size="middle">
                  <Descriptions.Item label="Order Number">
                    <strong>#{selectedOrder.order.order_number}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Employee">
                    <span className="text-gray-700">{selectedOrder.order.requested_by_name}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag 
                      color={statusConfig[selectedOrder.order.status]?.color}
                      icon={statusConfig[selectedOrder.order.status]?.icon}
                      className="flex items-center gap-1"
                    >
                      {statusConfig[selectedOrder.order.status]?.label}
                    </Tag>
                  </Descriptions.Item>
                  {selectedOrder.order.rejection_reason && (
                    <Descriptions.Item label="Rejection Reason">
                      <div className="rejection-reason">
                        <p className="rejection-reason-text">{selectedOrder.order.rejection_reason}</p>
                      </div>
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Date">
                    {selectedOrder.order.formattedDate}
                  </Descriptions.Item>
                  <Descriptions.Item label="Notes">
                    {selectedOrder.order.notes || <span className="no-notes-text">No notes</span>}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Card title="Order Items" variant="borderless" className="order-details-card">
                <Table
                  dataSource={selectedOrder.items}
                  columns={[
                    { 
                      title: 'Item', 
                      dataIndex: 'item_name', 
                      key: 'item_name',
                      render: (text) => <span className="font-medium">{text}</span>
                    },
                    { 
                      title: 'Quantity', 
                      dataIndex: 'quantity', 
                      key: 'quantity',
                      align: 'center'
                    },
                    { 
                      title: 'Unit', 
                      dataIndex: 'unit', 
                      key: 'unit',
                      render: (text) => <span className="text-gray-500">{text}</span>
                    },
                    { 
                      title: 'Reason', 
                      dataIndex: 'reason', 
                      key: 'reason',
                      render: (text) => {
                        const reasonMap = {
                          'out_of_stock': 'Out of stock',
                          'broken': 'Item damaged',
                          'new_employee': 'New employee',
                          'transferred': 'Transferred department',
                          'other': 'Other'
                        };
                        return reasonMap[text] || text;
                      }
                    }
                  ]}
                  pagination={false}
                  size="middle"
                  rowKey="id"
                  className="custom-table"
                />
              </Card>
            </div>
          ) : (
            <p>No order data available</p>
          )}
        </Modal>

        <Card 
          title={<span className="text-lg font-semibold">All Orders</span>}
          variant="borderless"
          className="order-table-card"
          extra={
            <Button 
              type="primary" 
              onClick={fetchOrders}
              loading={loading}
            >
              Refresh
            </Button>
          }
        >
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="id"
            loading={loading}
            pagination={{ 
              pageSize: 10, 
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} orders`
            }}
            scroll={{ x: true }}
            className="custom-table"
          />
        </Card>
      </div>
    </div>
  );
};

export default AdminOrder;