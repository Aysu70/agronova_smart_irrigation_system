import React from 'react';
import Card from '../common/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const MoistureChart = ({ data }) => {
  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Soil Moisture Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="time" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            domain={[0, 100]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="moisture" 
            stroke="#22c55e" 
            strokeWidth={2}
            dot={{ fill: '#22c55e' }}
            name="Soil Moisture (%)"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default MoistureChart;
