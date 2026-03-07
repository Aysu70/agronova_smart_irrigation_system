import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import { 
  MessageCircle, 
  ThumbsUp, 
  Eye, 
  Search, 
  Plus,
  CheckCircle,
  Send,
  Trophy,
  Users,
  Image as ImageIcon,
  AlertCircle,
  TrendingUp,
  Clock,
  Award,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Loader from '../components/common/Loader';

const PROBLEM_TYPES = [
  { id: 'irrigation', label: 'Irrigation', icon: '💧', color: 'blue' },
  { id: 'plant-disease', label: 'Plant Disease', icon: '🦠', color: 'red' },
  { id: 'soil-issues', label: 'Soil Issues', icon: '🌱', color: 'green' },
  { id: 'equipment-problems', label: 'Equipment Problems', icon: '⚙️', color: 'purple' },
  { id: 'weather-damage', label: 'Weather Damage', icon: '⛈️', color: 'yellow' },
  { id: 'pests', label: 'Pests', icon: '🐛', color: 'orange' },
  { id: 'fertilization', label: 'Fertilization', icon: '🌿', color: 'teal' },
  { id: 'harvesting', label: 'Harvesting', icon: '🌾', color: 'amber' },
  { id: 'general', label: 'General Question', icon: '💬', color: 'gray' },
  { id: 'other', label: 'Other', icon: '📋', color: 'slate' }
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Newest', icon: Clock },
  { value: 'active', label: 'Active', icon: TrendingUp },
  { value: 'popular', label: 'Popular', icon: ThumbsUp },
  { value: 'solved', label: 'Solved', icon: CheckCircle }
];

const CommunityHub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProblemType, setSelectedProblemType] = useState('all');
  const [stats, setStats] = useState(null);

  const [newPost, setNewPost] = useState({
    title: '',
    problemType: 'general',
    description: '',
    category: 'general-questions'
  });

  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchDiscussions();
    fetchStats();
  }, [sortBy, selectedProblemType]);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        sort: sortBy,
        ...(selectedProblemType !== 'all' && { problemType: selectedProblemType }),
        ...(searchQuery && { search: searchQuery })
      });
      
      const response = await api.get(`/discussions?${params}`);
      setDiscussions(response.data.data.discussions);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      toast.error('Failed to load discussions');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/discussions/statistics');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();

    if (!newPost.title || !newPost.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const postData = {
        title: newPost.title,
        content: newPost.description,
        category: newPost.category,
        problemType: newPost.problemType,
        tags: []
      };

      await api.post('/discussions', postData);
      toast.success('Problem posted successfully!');
      
      setNewPost({
        title: '',
        problemType: 'general',
        description: '',
        category: 'general-questions'
      });
      setShowPostForm(false);
      fetchDiscussions();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to post problem');
    }
  };

  const handleAddReply = async (discussionId) => {
    if (!replyText.trim()) return;

    try {
      await api.post(`/discussions/${discussionId}/replies`, { content: replyText });
      setReplyText('');
      toast.success('Reply added!');
      
      // Refresh selected discussion
      const response = await api.get(`/discussions/${discussionId}`);
      setSelectedDiscussion(response.data.data);
      fetchDiscussions();
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    }
  };

  const handleMarkHelpful = async (discussionId, replyId) => {
    try {
      await api.put(`/discussions/${discussionId}/replies/${replyId}/helpful`);
      toast.success('Marked as helpful!');
      
      const response = await api.get(`/discussions/${discussionId}`);
      setSelectedDiscussion(response.data.data);
      fetchDiscussions();
    } catch (error) {
      console.error('Error marking helpful:', error);
      toast.error('Failed to mark as helpful');
    }
  };

  const openDiscussion = async (id) => {
    try {
      const response = await api.get(`/discussions/${id}`);
      setSelectedDiscussion(response.data.data);
    } catch (error) {
      console.error('Error loading discussion:', error);
      toast.error('Failed to load discussion');
    }
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getProblemTypeConfig = (type) => {
    return PROBLEM_TYPES.find(pt => pt.id === type) || PROBLEM_TYPES.find(pt => pt.id === 'other');
  };

  const colorMap = {
    blue: 'bg-blue-100 text-blue-700 border-blue-300',
    red: 'bg-red-100 text-red-700 border-red-300',
    green: 'bg-green-100 text-green-700 border-green-300',
    purple: 'bg-purple-100 text-purple-700 border-purple-300',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    orange: 'bg-orange-100 text-orange-700 border-orange-300',
    teal: 'bg-teal-100 text-teal-700 border-teal-300',
    amber: 'bg-amber-100 text-amber-700 border-amber-300',
    gray: 'bg-gray-100 text-gray-700 border-gray-300',
    slate: 'bg-slate-100 text-slate-700 border-slate-300'
  };

  if (loading && discussions.length === 0) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <Navbar title="Farmers Community" />
        <div className="p-8 mt-16">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Farmers Community Network</h1>
            <p className="text-gray-600">
              Share problems, ask questions, and help fellow farmers
            </p>
          </div>

          {/* Quick Stats & Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <MessageCircle className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {stats?.total || 0}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">Total Discussions</h3>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {stats?.solved || 0}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">Problems Solved</h3>
            </div>

            <button
              onClick={() => navigate('/community/leaderboard')}
              className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow-sm p-5 hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-8 h-8 text-white" />
                 <span className="text-sm font-semibold text-white">View</span>
              </div>
              <h3 className="text-sm font-medium text-white">Top Farmers Ranking</h3>
            </button>

            <button
              onClick={() => navigate('/community/groups')}
              className="bg-gradient-to-br from-green-400 to-blue-500 rounded-lg shadow-sm p-5 hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-white" />
                <span className="text-sm font-semibold text-white">Browse</span>
              </div>
              <h3 className="text-sm font-medium text-white">Farmer Groups</h3>
            </button>
          </div>

          {/* Problem Posting Form */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200 p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              
              {!showPostForm ? (
                <button
                  onClick={() => setShowPostForm(true)}
                  className="flex-1 text-left px-6 py-4 bg-white rounded-lg border border-gray-300 hover:border-green-400 hover:shadow-md transition-all text-gray-500 hover:text-gray-700"
                >
                  Share a farming problem or ask a question...
                </button>
              ) : (
                <div className="flex-1">
                  <form onSubmit={handleCreatePost} className="space-y-4">
                    {/* Title */}
                    <input
                      type="text"
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      placeholder="What's your problem or question?"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                      required
                    />

                    {/* Problem Type */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Problem Type *
                        </label>
                        <select
                          value={newPost.problemType}
                          onChange={(e) => setNewPost({ ...newPost, problemType: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          {PROBLEM_TYPES.map(type => (
                            <option key={type.id} value={type.id}>
                              {type.icon} {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <select
                          value={newPost.category}
                          onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="general-questions">💬 General Questions</option>
                          <option value="irrigation-problems">💧 Irrigation Problems</option>
                          <option value="crop-diseases">🌾 Crop Diseases</option>
                          <option value="soil-fertility">🌱 Soil & Fertility</option>
                          <option value="equipment-devices">⚙️ Equipment & Devices</option>
                          <option value="weather-climate">🌤️ Weather & Climate</option>
                        </select>
                      </div>
                    </div>

                    {/* Description */}
                    <textarea
                      value={newPost.description}
                      onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                      placeholder="Describe your problem in detail..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      required
                    />

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-white transition-colors"
                      >
                        <ImageIcon className="w-4 h-4" />
                        Add Photo
                      </button>
                      
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setShowPostForm(false)}
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md"
                        >
                          <Send className="w-4 h-4" />
                          Post Problem
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Filters Sidebar */}
            <div className="col-span-3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 sticky top-24">
                <h3 className="font-bold text-gray-900 mb-4">Filter by Type</h3>
                
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedProblemType('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedProblemType === 'all'
                        ? 'bg-green-100 text-green-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    📋 All Problems
                  </button>
                  
                  {PROBLEM_TYPES.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedProblemType(type.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedProblemType === type.id
                          ? `${colorMap[type.color]} font-medium`
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {type.icon} {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Feed */}
            <div className="col-span-9">
              {/* Controls */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && fetchDiscussions()}
                      placeholder="Search problems..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-2">
                    {SORT_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        onClick={() => setSortBy(option.value)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          sortBy === option.value
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <option.icon className="w-4 h-4" />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Discussions Feed */}
              <div className="space-y-4">
                {discussions.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No discussions yet</h3>
                    <p className="text-gray-600 mb-4">Be the first to share a problem!</p>
                    <button
                      onClick={() => setShowPostForm(true)}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Post First Problem
                    </button>
                  </div>
                ) : (
                  discussions.map((discussion) => {
                    const problemType = getProblemTypeConfig(discussion.problemType || 'other');
                    
                    return (
                      <div
                        key={discussion._id}
                        onClick={() => openDiscussion(discussion._id)}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-green-300 hover:shadow-md transition-all cursor-pointer p-5"
                      >
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {discussion.author?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {discussion.isSolved && (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                  )}
                                  <h3 className="text-lg font-bold text-gray-900 hover:text-green-600 transition-colors">
                                    {discussion.title}
                                  </h3>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                  <span className="font-medium">{discussion.author?.name || 'Unknown'}</span>
                                  <span>•</span>
                                  <span>{formatTimeAgo(discussion.createdAt)}</span>
                                </div>
                              </div>

                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colorMap[problemType.color]}`}>
                                {problemType.icon} {problemType.label}
                              </span>
                            </div>

                            <p className="text-gray-700 mb-3 line-clamp-2">{discussion.content}</p>

                            {/* Stats */}
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <MessageCircle className="w-4 h-4" />
                                <span>{discussion.replies?.length || 0} replies</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="w-4 h-4" />
                                <span>{discussion.likes?.length || 0} helpful</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                <span>{discussion.views || 0} views</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Discussion Detail Modal */}
      {selectedDiscussion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {selectedDiscussion.isSolved && (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  )}
                  <h2 className="text-2xl font-bold text-gray-900">{selectedDiscussion.title}</h2>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                      {selectedDiscussion.author?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="font-medium">{selectedDiscussion.author?.name || 'Unknown'}</span>
                  </div>
                  <span>•</span>
                  <span>{formatTimeAgo(selectedDiscussion.createdAt)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {selectedDiscussion.views} views
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDiscussion(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Problem Content */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-gray-800 whitespace-pre-wrap mb-4">{selectedDiscussion.content}</p>
                
                {selectedDiscussion.problemType && (
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${
                    colorMap[(getProblemTypeConfig(selectedDiscussion.problemType).color)]
                  }`}>
                    {getProblemTypeConfig(selectedDiscussion.problemType).icon}{' '}
                    {getProblemTypeConfig(selectedDiscussion.problemType).label}
                  </span>
                )}
              </div>

              {/* Replies */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {selectedDiscussion.replies?.length || 0} Replies
                </h3>
                
                <div className="space-y-4">
                  {selectedDiscussion.replies?.map((reply) => (
                    <div
                      key={reply._id}
                      className={`p-4 rounded-lg ${
                        reply.isHelpful ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                          {reply.author?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">
                                {reply.author?.name || 'Unknown'}
                              </span>
                              {reply.isHelpful && (
                                <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                  <Award className="w-3 h-3" />
                                  Helpful Answer
                                </span>
                              )}
                              <span className="text-sm text-gray-500">
                                {formatTimeAgo(reply.createdAt)}
                              </span>
                            </div>
                            
                            {selectedDiscussion.author?._id === user?.id && !reply.isHelpful && (
                              <button
                                onClick={() => handleMarkHelpful(selectedDiscussion._id, reply._id)}
                                className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Mark as Helpful
                              </button>
                            )}
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reply Form */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Add Your Reply</h4>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Share your solution or advice..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none mb-3"
                />
                <button
                  onClick={() => handleAddReply(selectedDiscussion._id)}
                  disabled={!replyText.trim()}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityHub;
