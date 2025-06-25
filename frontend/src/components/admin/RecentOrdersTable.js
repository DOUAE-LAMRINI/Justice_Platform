import React from 'react';
import { Table, Tag } from 'antd';
import { Link } from 'react-router-dom';

const RecentOrdersTable = ({ orders }) => {
  const columns = [
    {
      title: 'Order Number',
      dataIndex: 'order_number',
      key: 'order_number',
      render: (text, record) => (
        <Link to={`/admin/orders/${record.id}`}>{text}</Link>
      )
    },
    {
      title: 'Employee',
      dataIndex: 'requested_by_name',
      key: 'employee_name'
    },
    {
      title: 'Date',
      dataIndex: 'order_date',
      key: 'order_date',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = '';
        switch (status) {
          case 'pending':
            color = 'var(--chart-color-3)';
            break;
          case 'approved':
            color = 'var(--chart-color-2)';
            break;
          case 'rejected':
            color = 'var(--chart-color-4)';
            break;
          case 'fulfilled':
            color = 'var(--chart-color-1)';
            break;
          default:
            color = 'var(--text-secondary)';
        }
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: 'Items',
      dataIndex: 'items_count',
      key: 'items_count'
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={orders}
      rowKey="id"
      pagination={false}
      size="small"
      className="dashboard-table"
    />
  );
};

export default RecentOrdersTable;