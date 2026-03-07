import React, { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import { adminAPI } from '../services/api';
import { 
  Users, 
  DollarSign, 
  Package, 
  Activity,
  Search,
  UserCheck,
  Calendar,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  ShoppingCart,
  CreditCard,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeDevices: 0,
    orderedDevices: 0,
    totalPayments: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all users
      const usersResponse = await adminAPI.getAllUsers();
      const users = usersResponse.data.data || [];
      
      // Calculate stats
      setStats({
        totalUsers: users.length,
        activeDevices: users.filter(u => u.role === 'user').length, // Simulated
        orderedDevices: users.length * 2, // Simulated
        totalPayments: users.length * 150 // Simulated
      });

      // Set recent users (last 5)
      setRecentUsers(users.slice(0, 5));
      
      // Simulated orders and payments
      setRecentOrders([
        { id: 1, userId: users[0]?._id, userName: users[0]?.name, device: 'AgroSmart Pro', status: 'Delivered', date: new Date(), amount: 299 },
        { id: 2, userId: users[1]?._id, userName: users[1]?.name, device: 'AgroSmart Basic', status: 'Processing', date: new Date(), amount: 199 },
        { id: 3, userId: users[2]?._id, userName: users[2]?.name, device: 'AgroSmart Pro', status: 'Shipped', date: new Date(), amount: 299 },
      ]);

      setRecentPayments([
        { id: 1, userId: users[0]?._id, userName: users[0]?.name, amount: 299, method: 'Credit Card', status: 'Completed', date: new Date() },
        { id: 2, userId: users[1]?._id, userName: users[1]?.name, amount: 199, method: 'PayPal', status: 'Completed', date: new Date() },
        { id: 3, userId: users[2]?._id, userName: users[2]?.name, amount: 299, method: 'Bank Transfer', status: 'Pending', date: new Date() },
      ]);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <Layout title="Admin Dashboard">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Admin Dashboard">
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage users, orders, payments, and system operations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-xs text-green-600 mt-2 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Active Devices */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Active Devices</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeDevices}</p>
                <p className="text-xs text-green-600 mt-2 flex items-center">
                  <Activity className="w-3 h-3 mr-1" />
                  Online now
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Ordered Devices */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Ordered Devices</p>
                <p className="text-3xl font-bold text-gray-900">{stats.orderedDevices}</p>
                <p className="text-xs text-orange-600 mt-2 flex items-center">
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  Last 30 days
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Total Payments */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Payments</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalPayments)}</p>
                <p className="text-xs text-purple-600 mt-2 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Revenue this month
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <a
            href="/admin/users"
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all"
          >
            <Users className="w-8 h-8 mb-3" />
            <p className="font-semibold text-lg">Users</p>
            <p className="text-sm opacity-90">Manage users</p>
          </a>

          <a
            href="/admin/orders"
            className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all"
          >
            <ShoppingCart className="w-8 h-8 mb-3" />
            <p className="font-semibold text-lg">Orders</p>
            <p className="text-sm opacity-90">View orders</p>
          </a>

          <a
            href="/admin/payments"
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all"
          >
            <CreditCard className="w-8 h-8 mb-3" />
            <p className="font-semibold text-lg">Payments</p>
            <p className="text-sm opacity-90">Payment history</p>
          </a>

          <a
            href="/admin/systems"
            className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all"
          >
            <Activity className="w-8 h-8 mb-3" />
            <p className="font-semibold text-lg">Devices</p>
            <p className="text-sm opacity-90">System monitor</p>
          </a>
        </div>

        {/* Recent Users Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Recent Users
            </h2>
            <a href="/admin/users" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All →
            </a>
          </div>

          {recentUsers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No users registered yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Region</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Joined</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm mr-3">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{user.email}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{user.region || 'N/A'}</td>
                      <td className="py-4 px-4 text-gray-600">{formatDate(user.createdAt)}</td>
                      <td className="py-4 px-4">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          <Eye className="w-4 h-4 inline mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Orders & Payments Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2 text-orange-600" />
                Recent Orders
              </h2>
              <a href="/admin/orders" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                View All →
              </a>
            </div>

            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{order.device}</p>
                    <p className="text-sm text-gray-500">{order.userName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(order.amount)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
                Recent Payments
              </h2>
              <a href="/admin/payments" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                View All →
              </a>
            </div>

            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{payment.userName}</p>
                    <p className="text-sm text-gray-500">{payment.method}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      payment.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
