import React from 'react';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip } from 'recharts';

const InventoryStatus = ({ stats }) => {
  const data = [
    {
      name: 'Total Items',
      value: stats.inventoryItems,
      fill: 'var(--chart-color-1)'
    },
    {
      name: 'Low Stock',
      value: stats.lowStock,
      fill: 'var(--chart-color-4)'
    }
  ];

  return (
    <div className="chart-container">
      <ResponsiveContainer>
        <RadialBarChart
          innerRadius="10%"
          outerRadius="80%"
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <RadialBar
            label={{ position: 'insideStart', fill: '#fff' }}
            background
            dataKey="value"
          />
          <Legend 
            iconSize={10} 
            layout="vertical" 
            verticalAlign="middle" 
            align="right" 
          />
          <Tooltip />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InventoryStatus;