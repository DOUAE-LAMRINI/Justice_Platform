import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatusPieChart = ({ orders }) => {
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  const data = [
    { name: 'Approved', value: statusCounts.approved || 0 },
    { name: 'Pending', value: statusCounts.pending || 0 },
    { name: 'Rejected', value: statusCounts.rejected || 0 },
    { name: 'Fulfilled', value: statusCounts.fulfilled || 0 }
  ];

  const COLORS = [
    'var(--chart-secondary)',
    'var(--chart-tertiary)',
    'var(--chart-danger)',
    'var(--chart-primary)'
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend 
          layout="vertical" 
          verticalAlign="middle" 
          align="right"
          wrapperStyle={{
            paddingLeft: '20px'
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default StatusPieChart;