import React, { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import { adminAPI } from '../services/api';
import { 
  ShoppingCart, 
  Search,
  Calendar,
  User,
  Package,
  Filter,
  Eye,
  Download,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getRegionLabel } from '../utils/constants';
import { DEMO_ORDERS } from '../utils/demoData';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    delivered: 0,
    cancelled: 0
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(o => 
        o.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.deviceName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getOrders();
      const ordersData = response.data.data || [];
      
      setOrders(ordersData);
      setFilteredOrders(ordersData);

      // Calculate stats
      setStats({
        total: ordersData.length,
        pending: ordersData.filter(o => o.status === 'pending').length,
        processing: ordersData.filter(o => o.status === 'processing').length,
        delivered: ordersData.filter(o => o.status === 'delivered').length,
        cancelled: ordersData.filter(o => o.status === 'cancelled').length
      });

    } catch (error) {
      setOrders(DEMO_ORDERS);
      setFilteredOrders(DEMO_ORDERS);
      setStats({
        total: DEMO_ORDERS.length,
        pending: DEMO_ORDERS.filter(o => o.status === 'pending').length,
        processing: DEMO_ORDERS.filter(o => o.status === 'processing').length,
        delivered: DEMO_ORDERS.filter(o => o.status === 'delivered').length,
        cancelled: DEMO_ORDERS.filter(o => o.status === 'cancelled').length
      });
      toast('Showing demo orders data', { icon: '🧪' });
      console.error(error);
    } finally {
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

  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'shipped':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'processing':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'pending':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const displayStatus = (status) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  if (loading) {
    return (
      <Layout title="Orders Management">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Orders Management">
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <ShoppingCart className="w-8 h-8 mr-3 text-orange-600" />
            Orders Management
          </h1>
          <p className="text-gray-600 mt-2">View and manage all device orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{stats.pending}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.processing}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.delivered}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.cancelled}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by order ID, customer, or device..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No orders found</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Device
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">{order.orderId}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-xs mr-3">
                            {order.userName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{order.userName}</p>
                            <p className="text-xs text-gray-500">{order.userEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{order.deviceName}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                          {displayStatus(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDate(order.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => viewOrderDetails(order)}
                          className="text-orange-600 hover:text-orange-700 font-medium flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
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

        {/* Summary Footer */}
        <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
          <span>Showing {filteredOrders.length} of {orders.length} orders</span>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>

        {/* Order Details Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900">Order Details</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Order ID</p>
                    <p className="text-lg font-bold text-gray-900">{selectedOrder.orderId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(selectedOrder.status)}`}>
                      {displayStatus(selectedOrder.status)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-2">Customer Information</p>
                    <p className="text-base font-medium text-gray-900">{selectedOrder.userName}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.userEmail}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-2">Order Details</p>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700">Device:</span>
                      <span className="font-medium text-gray-900">{selectedOrder.deviceName}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700">Quantity:</span>
                      <span className="font-medium text-gray-900">{selectedOrder.quantity}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Amount:</span>
                      <span className="font-bold text-lg text-gray-900">{formatCurrency(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-2">Shipping & Payment</p>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700">Shipping Address:</span>
                      <span className="font-medium text-gray-900 text-right">
                        {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.region}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700">Payment Method:</span>
                      <span className="font-medium text-gray-900">{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Payment Status:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                        selectedOrder.paymentStatus === 'unpaid' ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-2">Dates</p>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700">Order Date:</span>
                      <span className="font-medium text-gray-900">{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    {selectedOrder.estimatedDelivery && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Estimated Delivery:</span>
                        <span className="font-medium text-gray-900">{formatDate(selectedOrder.estimatedDelivery)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminOrders;
