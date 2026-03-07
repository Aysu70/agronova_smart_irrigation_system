import React, { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import { adminAPI } from '../services/api';
import { 
  CreditCard, 
  Search,
  Calendar,
  User,
  DollarSign,
  Filter,
  Eye,
  Download,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    totalAmount: 0,
    completed: 0,
    pending: 0,
    failed: 0
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = payments;

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(p => {
        const paymentDate = new Date(p.paymentDate);
        const diffDays = Math.floor((now - paymentDate) / (1000 * 60 * 60 * 24));
        
        if (dateFilter === 'today') return diffDays === 0;
        if (dateFilter === 'week') return diffDays <= 7;
        if (dateFilter === 'month') return diffDays <= 30;
        return true;
      });
    }

    setFilteredPayments(filtered);
  }, [searchTerm, statusFilter, dateFilter, payments]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      // Get users for simulated payments
      const response = await adminAPI.getAllUsers();
      const users = response.data.data || [];
      
      // Generate simulated payments (replace with real API later)
      const simulatedPayments = users.flatMap((user, index) => [
        {
          paymentId: `PAY-${2000 + index * 3}`,
          transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          userId: user._id,
          userName: user.name,
          userEmail: user.email,
          amount: [199, 249, 299, 349][index % 4],
          method: ['Credit Card', 'PayPal', 'Bank Transfer', 'Debit Card'][index % 4],
          status: ['Completed', 'Completed', 'Pending', 'Failed'][index % 4],
          paymentDate: new Date(Date.now() - (index * 72000000)),
          description: `Payment for ${['AgroSmart Pro', 'AgroSmart Basic', 'AgroSmart Plus'][index % 3]}`,
          cardLast4: index % 4 === 0 ? '4242' : null,
          currency: 'USD'
        }
      ]);

      setPayments(simulatedPayments);
      setFilteredPayments(simulatedPayments);

      // Calculate stats
      const totalAmount = simulatedPayments.reduce((sum, p) => sum + p.amount, 0);
      setStats({
        total: simulatedPayments.length,
        totalAmount: totalAmount,
        completed: simulatedPayments.filter(p => p.status === 'Completed').length,
        pending: simulatedPayments.filter(p => p.status === 'Pending').length,
        failed: simulatedPayments.filter(p => p.status === 'Failed').length
      });

    } catch (error) {
      toast.error('Failed to load payments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'Pending':
        return <Clock className="w-4 h-4" />;
      case 'Failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Failed':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const viewPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  if (loading) {
    return (
      <Layout title="Payments">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Payments">
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <CreditCard className="w-8 h-8 mr-3 text-purple-600" />
            Payments History
          </h1>
          <p className="text-gray-600 mt-2">View and manage all payment transactions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-purple-600">{formatCurrency(stats.totalAmount)}</p>
                <p className="text-xs text-green-600 mt-2 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +15% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                <p className="text-xs text-gray-500 mt-2">Successful payments</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-xs text-gray-500 mt-2">Awaiting confirmation</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Failed</p>
                <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
                <p className="text-xs text-gray-500 mt-2">Unsuccessful payments</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by payment ID, customer, or transaction..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredPayments.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No payments found</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.paymentId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">{payment.paymentId}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold text-xs mr-3">
                            {payment.userName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{payment.userName}</p>
                            <p className="text-xs text-gray-500">{payment.userEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{payment.description}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(payment.amount)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{payment.method}</span>
                        {payment.cardLast4 && (
                          <span className="text-xs text-gray-500 block">****{payment.cardLast4}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border flex items-center w-fit ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          <span className="ml-1">{payment.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDate(payment.paymentDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => viewPaymentDetails(payment)}
                          className="text-purple-600 hover:text-purple-700 font-medium flex items-center"
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
          <span>Showing {filteredPayments.length} of {payments.length} payments</span>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>

        {/* Payment Details Modal */}
        {showModal && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900">Payment Details</h3>
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
                    <p className="text-sm text-gray-500 mb-1">Payment ID</p>
                    <p className="text-lg font-bold text-gray-900">{selectedPayment.paymentId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(selectedPayment.status)}`}>
                      {selectedPayment.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-2">Transaction Information</p>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700">Transaction ID:</span>
                      <span className="font-medium text-gray-900 font-mono text-sm">{selectedPayment.transactionId}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Currency:</span>
                      <span className="font-medium text-gray-900">{selectedPayment.currency}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-2">Customer Information</p>
                    <p className="text-base font-medium text-gray-900">{selectedPayment.userName}</p>
                    <p className="text-sm text-gray-600">{selectedPayment.userEmail}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-2">Payment Details</p>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700">Description:</span>
                      <span className="font-medium text-gray-900">{selectedPayment.description}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700">Method:</span>
                      <span className="font-medium text-gray-900">{selectedPayment.method}</span>
                    </div>
                    {selectedPayment.cardLast4 && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700">Card:</span>
                        <span className="font-medium text-gray-900 font-mono">**** **** **** {selectedPayment.cardLast4}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-2">
                      <span className="text-gray-700">Amount:</span>
                      <span className="font-bold text-xl text-gray-900">{formatCurrency(selectedPayment.amount)}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-2">Date & Time</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedPayment.paymentDate)}</p>
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
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Receipt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminPayments;
