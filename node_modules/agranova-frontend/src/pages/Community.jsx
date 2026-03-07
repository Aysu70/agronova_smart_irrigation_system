import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import CreatePostModal from '../components/CreatePostModal';
import PostCard from '../components/PostCard';
import { 
  Search, 
  Plus,
  Filter,
  TrendingUp,
  Clock,
  MessageCircle,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Loader from '../components/common/Loader';
import { PROBLEM_TYPES, SORT_OPTIONS } from '../utils/communityConstants';

const Community = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProblemType, setSelectedProblemType] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProblemType, sortBy, searchTerm, pagination.page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        sort: sortBy
      });
      
      if (selectedProblemType) params.append('problemType', selectedProblemType);
      if (searchTerm) params.append('search', searchTerm);

      const response = await api.get(`/posts?${params.toString()}`);
      
      if (response.data.success) {
        setPosts(response.data.posts);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (formData) => {
    try {
      setIsSubmitting(true);
      const response = await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('Post created successfully!');
        setShowCreateModal(false);
        fetchPosts(); // Refresh posts
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/like`);
      
      if (response.data.success) {
        // Update posts locally
        setPosts(posts.map(post => 
          post._id === postId 
            ? { 
                ...post, 
                likeCount: response.data.likeCount,
                isLikedByUser: response.data.liked
              }
            : post
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleComment = async (postId, content) => {
    try {
      const response = await api.post(`/posts/${postId}/comments`, { content });
      
      if (response.data.success) {
        toast.success('Comment added!');
        
        // Update posts locally
        setPosts(posts.map(post => 
          post._id === postId 
            ? { 
                ...post, 
                commentCount: response.data.commentCount,
                comments: [...(post.comments || []), response.data.comment]
              }
            : post
        ));
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const response = await api.delete(`/posts/${postId}`);
      
      if (response.data.success) {
        toast.success('Post deleted successfully');
        setPosts(posts.filter(post => post._id !== postId));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error(error.response?.data?.message || 'Failed to delete post');
    }
  };

  const handleEditPost = (post) => {
    // TODO: Implement edit functionality
    toast.info('Edit functionality coming soon!');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleFilterChange = (problemType) => {
    setSelectedProblemType(problemType);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleLoadMore = () => {
    if (pagination.page < pagination.pages) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Community Discussion
              </h1>
              <p className="text-gray-600">
                Share problems, ask questions, and help fellow farmers
              </p>
            </div>

            {/* Search & Actions */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Create Post Button */}
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center justify-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Plus className="w-5 h-5" />
                  New Post
                </button>
              </div>
            </div>

            {/* Filters & Sort */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              {/* Problem Type Filter */}
              <div className="flex-1 bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Filter by Problem Type</h3>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleFilterChange('')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      selectedProblemType === ''
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Posts
                  </button>
                  
                  {PROBLEM_TYPES.map(type => (
                    <button
                      key={type.value}
                      onClick={() => handleFilterChange(type.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                        selectedProblemType === type.value
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                      {selectedProblemType === type.value && (
                        <X className="w-4 h-4 ml-1" onClick={(e) => {
                          e.stopPropagation();
                          handleFilterChange('');
                        }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div className="bg-white rounded-lg shadow-sm p-4 lg:w-64">
                <h3 className="font-semibold text-gray-900 mb-3">Sort By</h3>
                <div className="space-y-2">
                  {SORT_OPTIONS.map(option => {
                    const Icon = option.icon === 'Clock' ? Clock : 
                                 option.icon === 'TrendingUp' ? TrendingUp : 
                                 MessageCircle;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleSortChange(option.value)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                          sortBy === option.value
                            ? 'bg-green-100 text-green-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Posts List */}
            {loading && posts.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <Loader />
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No posts yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Be the first to share a problem or question!
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Plus className="w-5 h-5" />
                  Create First Post
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {posts.map(post => (
                    <PostCard
                      key={post._id}
                      post={post}
                      onLike={handleLike}
                      onComment={handleComment}
                      onDelete={handleDeletePost}
                      onEdit={handleEditPost}
                      currentUserId={user?._id}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="mt-8 flex justify-center items-center gap-4">
                    <p className="text-gray-600">
                      Page {pagination.page} of {pagination.pages}
                    </p>
                    
                    {pagination.page < pagination.pages && (
                      <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Loading...' : 'Load More'}
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePost}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Community;
