import React, { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import { adminAPI } from '../services/api';
import { 
  Users, 
  Search,
  UserCheck,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Eye,
  Trash2,
  UserCog,
  Shield,
  UserX,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AZERBAIJAN_REGIONS, getRegionLabel } from '../utils/constants';
import { DEMO_USERS } from '../utils/demoData';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [stats, setStats] = useState({ total: 0, admins: 0, users: 0 });

  const updateUserStats = (usersData) => {
    const admins = usersData.filter(u => u.role === 'admin').length;
    setStats({
      total: usersData.length,
      admins,
      users: usersData.length - admins
    });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    // Region filter
    if (regionFilter !== 'all') {
      filtered = filtered.filter(u => u.region === regionFilter);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, regionFilter, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers();
      const usersData = response.data.data || [];
      setUsers(usersData);
      setFilteredUsers(usersData);
      updateUserStats(usersData);
      setIsDemoMode(false);
    } catch (error) {
      setUsers(DEMO_USERS);
      setFilteredUsers(DEMO_USERS);
      updateUserStats(DEMO_USERS);
      setIsDemoMode(true);
      toast('Showing demo users data', { icon: '🧪' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (userId, userName) => {
    if (!window.confirm(`Promote ${userName} to Admin?`)) return;

    if (isDemoMode) {
      const updated = users.map((user) => user._id === userId ? { ...user, role: 'admin' } : user);
      setUsers(updated);
      updateUserStats(updated);
      toast.success(`${userName} promoted to Admin (demo)`);
      return;
    }

    try {
      await adminAPI.promoteToAdmin(userId);
      toast.success(`${userName} promoted to Admin`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to promote user');
    }
  };

  const handleDemote = async (userId, userName) => {
    if (!window.confirm(`Demote ${userName} to regular User?`)) return;

    if (isDemoMode) {
      const updated = users.map((user) => user._id === userId ? { ...user, role: 'user' } : user);
      setUsers(updated);
      updateUserStats(updated);
      toast.success(`${userName} demoted to User (demo)`);
      return;
    }

    try {
      await adminAPI.demoteToUser(userId);
      toast.success(`${userName} demoted to User`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to demote user');
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) return;

    if (isDemoMode) {
      const updated = users.filter((user) => user._id !== userId);
      setUsers(updated);
      updateUserStats(updated);
      toast.success(`${userName} deleted successfully (demo)`);
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      toast.success(`${userName} deleted successfully`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  if (loading) {
    return (
      <Layout title="User Management">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="User Management">
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="w-8 h-8 mr-3 text-blue-600" />
            User Management
          </h1>
          <p className="text-gray-600 mt-2">View and manage all registered users</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Administrators</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.admins}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Regular Users</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.users}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
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
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="admin">Administrators</option>
                <option value="user">Users</option>
              </select>
            </div>

            {/* Region Filter */}
            <div>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Regions</option>
                {AZERBAIJAN_REGIONS.map(region => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No users found</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Region
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-700 border border-purple-300' 
                            : 'bg-green-100 text-green-700 border border-green-300'
                        }`}>
                          {user.role === 'admin' ? (
                            <><Shield className="w-3 h-3 inline mr-1" />Administrator</>
                          ) : (
                            <><UserCheck className="w-3 h-3 inline mr-1" />User</>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          {getRegionLabel(user.region) || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => viewUserDetails(user)}
                            className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </button>
                          {user.role === 'user' ? (
                            <button
                              onClick={() => handlePromote(user._id, user.name)}
                              className="text-purple-600 hover:text-purple-700 font-medium flex items-center"
                              title="Promote to Admin"
                            >
                              <Shield className="w-4 h-4 mr-1" />
                              Promote
                            </button>
                          ) : user.email !== 'admin@agranova.com' && (
                            <button
                              onClick={() => handleDemote(user._id, user.name)}
                              className="text-orange-600 hover:text-orange-700 font-medium flex items-center"
                              title="Demote to User"
                            >
                              <UserX className="w-4 h-4 mr-1" />
                              Demote
                            </button>
                          )}
                          {user.email !== 'admin@agranova.com' && (
                            <button
                              onClick={() => handleDelete(user._id, user.name)}
                              className="text-red-600 hover:text-red-700 font-medium flex items-center"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </button>
                          )}
                        </div>
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
          <span>Showing {filteredUsers.length} of {users.length} users</span>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>

        {/* User Details Modal */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900">User Details</h3>
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
                <div className="flex items-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-3xl">
                    {selectedUser.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-6">
                    <h4 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h4>
                    <span className={`mt-2 inline-block px-3 py-1 text-sm font-medium rounded-full ${
                      selectedUser.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {selectedUser.role}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="text-base font-medium text-gray-900">{selectedUser.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Region</p>
                      <p className="text-base font-medium text-gray-900">{getRegionLabel(selectedUser.region) || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Registration Date</p>
                      <p className="text-base font-medium text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                    </div>
                  </div>

                  {selectedUser.crops && selectedUser.crops.length > 0 && (
                    <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                      <svg className="w-5 h-5 text-gray-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">Crops</p>
                        <p className="text-base font-medium text-gray-900">{selectedUser.crops.join(', ')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminUsers;
