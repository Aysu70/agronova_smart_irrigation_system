import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Lock, Globe, MapPin, TrendingUp, MessageCircle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import Loader from '../components/common/Loader';

const categoryConfig = {
  'irrigation': { name: 'Irrigation', icon: '💧', color: 'bg-blue-100 text-blue-700' },
  'crops': { name: 'Crops', icon: '🌾', color: 'bg-green-100 text-green-700' },
  'livestock': { name: 'Livestock', icon: '🐄', color: 'bg-orange-100 text-orange-700' },
  'equipment': { name: 'Equipment', icon: '🚜', color: 'bg-purple-100 text-purple-700' },
  'marketing': { name: 'Marketing', icon: '💼', color: 'bg-pink-100 text-pink-700' },
  'general': { name: 'General', icon: '💬', color: 'bg-gray-100 text-gray-700' }
};

const FarmerGroups = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    type: 'public',
    category: 'general',
    rules: [],
    tags: []
  });

  useEffect(() => {
    fetchGroups();
  }, [filter]);

  useEffect(() => {
    filterGroups();
  }, [groups, selectedCategory, searchQuery]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/groups?type=${filter}`);
      setGroups(response.data.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const filterGroups = () => {
    let filtered = [...groups];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(g => g.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(g =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredGroups(filtered);
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();

    if (!newGroup.name || !newGroup.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await api.post('/groups', newGroup);
      toast.success('Group created successfully!');
      setShowCreateModal(false);
      setNewGroup({
        name: '',
        description: '',
        type: 'public',
        category: 'general',
        rules: [],
        tags: []
      });
      fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error(error.response?.data?.message || 'Failed to create group');
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await api.post(`/groups/${groupId}/join`);
      toast.success('Joined group successfully!');
      fetchGroups();
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error(error.response?.data?.message || 'Failed to join group');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <Navbar title="Farmer Groups" />
        <div className="p-8 mt-16">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Users className="w-8 h-8 text-green-600" />
                Farmer Groups
              </h1>
              <p className="text-gray-600">
                Join groups to collaborate with farmers who share your interests
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
            >
              <Plus className="w-5 h-5" />
              Create Group
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-12 gap-4">
              {/* Type Filter */}
              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Group Type</label>
                <div className="flex gap-2">
                  {['all', 'public', 'my-groups'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilter(type)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === type
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type === 'my-groups' ? 'My Groups' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.icon} {config.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="col-span-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search groups..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Groups Grid */}
          {filteredGroups.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No groups found</h3>
              <p className="text-gray-600 mb-4">
                {filter === 'my-groups' 
                  ? "You haven't joined any groups yet" 
                  : 'No groups match your search criteria'}
              </p>
              {filter !== 'my-groups' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create First Group
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => (
                <div
                  key={group._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate(`/community/groups/${group._id}`)}
                >
                  {/* Group Header */}
                  <div className="h-32 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center relative">
                    <div className="text-6xl opacity-80">
                      {categoryConfig[group.category]?.icon || '💬'}
                    </div>
                    {group.type === 'private' && (
                      <div className="absolute top-3 right-3 bg-gray-900/70 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs">
                        <Lock className="w-3 h-3" />
                        Private
                      </div>
                    )}
                    {group.type === 'public' && (
                      <div className="absolute top-3 right-3 bg-white/90 text-gray-700 px-2 py-1 rounded-full flex items-center gap-1 text-xs">
                        <Globe className="w-3 h-3" />
                        Public
                      </div>
                    )}
                  </div>

                  {/* Group Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                        {group.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryConfig[group.category]?.color}`}>
                        {categoryConfig[group.category]?.name}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {group.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{group.members?.length || 0} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{group.posts?.length || 0} posts</span>
                      </div>
                    </div>

                    {/* Creator */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                      <MapPin className="w-3 h-3" />
                      <span>Created by {group.creator?.name || 'Unknown'}</span>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinGroup(group._id);
                      }}
                      disabled={group.members?.some(m => m.user === group._id)}
                      className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {group.members?.some(m => m.user === group._id) ? 'Joined' : 'Join Group'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Group</h2>

              <form onSubmit={handleCreateGroup} className="space-y-6">
                {/* Group Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Tomato Farmers Network"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="Describe what your group is about..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={newGroup.category}
                      onChange={(e) => setNewGroup({ ...newGroup, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {Object.entries(categoryConfig).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.icon} {config.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Privacy
                    </label>
                    <select
                      value={newGroup.type}
                      onChange={(e) => setNewGroup({ ...newGroup, type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="public">🌐 Public</option>
                      <option value="private">🔒 Private</option>
                    </select>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Create Group
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerGroups;
