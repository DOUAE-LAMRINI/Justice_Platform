import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RatingsChart = ({ ratings }) => {
  const ratingCounts = [0, 0, 0, 0, 0];
  ratings.forEach(rating => {
    if (rating.rating >= 1 && rating.rating <= 5) {
      ratingCounts[rating.rating - 1]++;
    }
  });

  const data = ratingCounts.map((count, index) => ({
    name: `${index + 1} Star`,
    count
  }));

  return (
    <div className="chart-container">
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: 'var(--text-secondary)' }}
          />
          <YAxis 
            tick={{ fill: 'var(--text-secondary)' }}
          />
          <Tooltip />
          <Legend />
          <Bar 
            dataKey="count" 
            fill="var(--chart-color-4)" 
            name="Number of Ratings" 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RatingsChart;