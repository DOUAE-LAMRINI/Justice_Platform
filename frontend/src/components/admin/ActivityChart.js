import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ActivityChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-primary)" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="var(--chart-primary)" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-secondary)" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="var(--chart-secondary)" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis 
          dataKey="date" 
          tick={{ fill: 'var(--text-secondary)' }}
        />
        <YAxis 
          tick={{ fill: 'var(--text-secondary)' }}
        />
        <Tooltip />
        <Area 
          type="monotone" 
          dataKey="orders" 
          stroke="var(--chart-primary)"
          fillOpacity={1} 
          fill="url(#colorOrders)" 
          name="Orders"
        />
        <Area 
          type="monotone" 
          dataKey="messages" 
          stroke="var(--chart-secondary)"
          fillOpacity={1} 
          fill="url(#colorMessages)" 
          name="Messages"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default ActivityChart;