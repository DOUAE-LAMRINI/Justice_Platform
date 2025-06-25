import React from 'react';
import { Table, Tag } from 'antd';
import { Link } from 'react-router-dom';

const MessagesSummary = ({ messages }) => {
  const columns = [
    {
      title: 'Name',
      dataIndex: 'full_name',
      key: 'full_name',
      render: (text, record) => (
        <Link to={`/admin/messages/${record.id}`}>{text}</Link>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = '';
        switch (status) {
          case 'new':
            color = 'var(--chart-color-1)';
            break;
          case 'pending':
            color = 'var(--chart-color-3)';
            break;
          case 'replied':
            color = 'var(--chart-color-2)';
            break;
          default:
            color = 'var(--text-secondary)';
        }
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString()
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={messages}
      rowKey="id"
      pagination={false}
      size="small"
      className="dashboard-table"
    />
  );
};

export default MessagesSummary;