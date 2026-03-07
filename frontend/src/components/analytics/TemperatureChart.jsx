import React from 'react';
import Card from '../common/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const TemperatureChart = ({ data }) => {
  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Temperature & Humidity</h3>
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
            dataKey="temperature" 
            stroke="#f59e0b" 
            strokeWidth={2}
            dot={{ fill: '#f59e0b' }}
            name="Temperature (°C)"
          />
          <Line 
            type="monotone" 
            dataKey="humidity" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6' }}
            name="Humidity (%)"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default TemperatureChart;
