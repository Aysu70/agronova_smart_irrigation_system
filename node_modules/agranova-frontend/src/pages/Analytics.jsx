import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import WaterUsageChart from '../components/analytics/WaterUsageChart';
import MoistureChart from '../components/analytics/MoistureChart';
import TemperatureChart from '../components/analytics/TemperatureChart';
import Card from '../components/common/Card';
import { sensorAPI } from '../services/api';
import { Calendar, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [period, setPeriod] = useState('7d');
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [period]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await sensorAPI.getHistory(period);
      const data = response.data.data;
      
      // Transform data for charts
      const transformed = data.map(item => ({
        time: new Date(item.timestamp).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          month: 'short',
          day: 'numeric'
        }),
        moisture: item.soilMoisture,
        temperature: item.temperature,
        humidity: item.humidity,
        usage: item.pumpStatus === 'ON' ? Math.random() * 10 + 5 : 0 // Simulated water usage
      }));
      
      setHistoryData(transformed);
    } catch (error) {
      toast.error('Failed to load analytics data');
    }
    setLoading(false);
  };

  const handleExport = () => {
    const csv = [
      ['Time', 'Moisture', 'Temperature', 'Humidity'],
      ...historyData.map(d => [d.time, d.moisture, d.temperature, d.humidity])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agranova-analytics-${period}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <Navbar title="Analytics" />
        <div className="p-8 mt-16">
          {/* Controls */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Calendar className="w-5 h-5 text-gray-600" />
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
            
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Export Data</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading analytics...</p>
            </div>
          ) : (
            <>
              {/* Charts */}
              <div className="space-y-6 mb-8">
                <WaterUsageChart data={historyData} />
                <MoistureChart data={historyData} />
                <TemperatureChart data={historyData} />
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <h4 className="text-sm text-gray-500 mb-2">Average Moisture</h4>
                  <p className="text-3xl font-bold text-green-600">
                    {historyData.length > 0
                      ? Math.round(historyData.reduce((sum, d) => sum + d.moisture, 0) / historyData.length)
                      : 0}%
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Last {period}</p>
                </Card>

                <Card>
                  <h4 className="text-sm text-gray-500 mb-2">Average Temperature</h4>
                  <p className="text-3xl font-bold text-orange-600">
                    {historyData.length > 0
                      ? Math.round(historyData.reduce((sum, d) => sum + d.temperature, 0) / historyData.length * 10) / 10
                      : 0}°C
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Last {period}</p>
                </Card>

                <Card>
                  <h4 className="text-sm text-gray-500 mb-2">Data Points</h4>
                  <p className="text-3xl font-bold text-blue-600">{historyData.length}</p>
                  <p className="text-sm text-gray-500 mt-2">Readings collected</p>
                </Card>
              </div>
            </>
          )}

          {/* Info */}
          <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6">
            <h4 className="font-semibold text-green-900 mb-2">📈 Analytics Insights</h4>
            <p className="text-green-800">
              Use this data to optimize your irrigation schedule and improve crop yields. 
              Historical trends help predict future water needs and identify potential issues early.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
