import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, MessageCircle, Send, Heart, ArrowLeft, Settings, UserPlus, LogOut, Image as ImageIcon, Globe, Lock } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import Loader from '../components/common/Loader';

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [userRole, setUserRole] = useState('visitor');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [newPost, setNewPost] = useState('');
  const [newComment, setNewComment] = useState({});

  useEffect(() => {
    fetchGroup();
  }, [id]);

  const fetchGroup = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/groups/${id}`);
      setGroup(response.data.data);
      setUserRole(response.data.userRole);
    } catch (error) {
      console.error('Error fetching group:', error);
      toast.error('Failed to load group');
      navigate('/community/groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      await api.post(`/groups/${id}/posts`, { content: newPost });
      setNewPost('');
      toast.success('Post created!');
      fetchGroup();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
  };

  const handleLikePost = async (postId) => {
    try {
      await api.post(`/groups/${id}/posts/${postId}/like`);
      fetchGroup();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = async (postId) => {
    const comment = newComment[postId];
    if (!comment?.trim()) return;

    try {
      await api.post(`/groups/${id}/posts/${postId}/comments`, { content: comment });
      setNewComment({ ...newComment, [postId]: '' });
      toast.success('Comment added!');
      fetchGroup();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm('Are you sure you want to leave this group?')) return;

    try {
      await api.post(`/groups/${id}/leave`);
      toast.success('Left group successfully');
      navigate('/community/groups');
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error(error.response?.data?.message || 'Failed to leave group');
    }
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) return <Loader />;
  if (!group) return null;

  const isMember = userRole !== 'visitor';

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <Navbar title={group.name} />
        <div className="p-8 mt-16">
          {/* Back Button */}
          <button
            onClick={() => navigate('/community/groups')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Groups
          </button>

          {/* Group Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center relative">
              <div className="text-8xl opacity-80">
                {group.category === 'irrigation' && '💧'}
                {group.category === 'crops' && '🌾'}
                {group.category === 'livestock' && '🐄'}
                {group.category === 'equipment' && '🚜'}
                {group.category === 'marketing' && '💼'}
                {group.category === 'general' && '💬'}
              </div>
              {group.type === 'private' ? (
                <div className="absolute top-4 right-4 bg-gray-900/70 text-white px-3 py-1 rounded-full flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Private Group
                </div>
              ) : (
                <div className="absolute top-4 right-4 bg-white/90 text-gray-700 px-3 py-1 rounded-full flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Public Group
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{group.name}</h1>
                  <p className="text-gray-600 mb-4">{group.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{group.members?.length || 0} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{group.posts?.length || 0} posts</span>
                    </div>
                  </div>
                </div>

                {isMember ? (
                  <div className="flex gap-2">
                    {userRole === 'admin' && (
                      <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        <Settings className="w-4 h-4" />
                        Manage
                      </button>
                    )}
                    <button
                      onClick={handleLeaveGroup}
                      className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Leave
                    </button>
                  </div>
                ) : (
                  <button className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <UserPlus className="w-4 h-4" />
                    Join Group
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'posts'
                    ? 'border-b-2 border-green-600 text-green-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Posts ({group.posts?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'members'
                    ? 'border-b-2 border-green-600 text-green-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Members ({group.members?.length || 0})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Main Content */}
            <div className="col-span-8">
              {activeTab === 'posts' ? (
                <>
                  {/* Create Post (if member) */}
                  {isMember && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                      <form onSubmit={handleCreatePost}>
                        <textarea
                          value={newPost}
                          onChange={(e) => setNewPost(e.target.value)}
                          placeholder="Share something with the group..."
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none mb-3"
                        />
                        <div className="flex justify-between items-center">
                          <button
                            type="button"
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <ImageIcon className="w-4 h-4" />
                            Add Photo
                          </button>
                          <button
                            type="submit"
                            disabled={!newPost.trim()}
                            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Send className="w-4 h-4" />
                            Post
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Posts List */}
                  <div className="space-y-4">
                    {group.posts && group.posts.length > 0 ? (
                      [...group.posts].reverse().map((post) => (
                        <div key={post._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                          {/* Post Header */}
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
                              {post.author?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{post.author?.name || 'Unknown'}</h4>
                              <p className="text-sm text-gray-600">{formatTimeAgo(post.createdAt)}</p>
                            </div>
                          </div>

                          {/* Post Content */}
                          <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.content}</p>

                          {/* Post Actions */}
                          <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
                            <button
                              onClick={() => handleLikePost(post._id)}
                              className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
                                post.likes?.includes(user?.id)
                                  ? 'text-red-600 bg-red-50'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              <Heart className="w-4 h-4" fill={post.likes?.includes(user?.id) ? 'currentColor' : 'none'} />
                              <span className="text-sm font-medium">{post.likes?.length || 0}</span>
                            </button>
                            <button className="flex items-center gap-2 px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                              <MessageCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">{post.comments?.length || 0}</span>
                            </button>
                          </div>

                          {/* Comments */}
                          {post.comments && post.comments.length > 0 && (
                            <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-200">
                              {post.comments.map((comment) => (
                                <div key={comment._id} className="flex gap-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                    {comment.author?.name?.charAt(0).toUpperCase() || 'U'}
                                  </div>
                                  <div className="flex-1 bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-sm text-gray-900">
                                        {comment.author?.name || 'Unknown'}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {formatTimeAgo(comment.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-700">{comment.content}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add Comment */}
                          {isMember && (
                            <div className="mt-4 flex gap-2">
                              <input
                                type="text"
                                value={newComment[post._id] || ''}
                                onChange={(e) => setNewComment({ ...newComment, [post._id]: e.target.value })}
                                placeholder="Write a comment..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddComment(post._id);
                                  }
                                }}
                              />
                              <button
                                onClick={() => handleAddComment(post._id)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
                        <p className="text-gray-600">
                          {isMember ? 'Be the first to share something!' : 'Join the group to see posts'}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Members Tab */
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="divide-y divide-gray-200">
                    {group.members?.map((member) => (
                      <div key={member._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                            {member.user?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{member.user?.name || 'Unknown'}</h4>
                            <p className="text-sm text-gray-600">{member.user?.email || ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            member.role === 'admin' 
                              ? 'bg-purple-100 text-purple-700' 
                              : member.role === 'moderator'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="col-span-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 sticky top-24">
                <h3 className="font-bold text-gray-900 mb-4">About This Group</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Category</h4>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      {group.category.charAt(0).toUpperCase() + group.category.slice(1)}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Created By</h4>
                    <p className="text-sm text-gray-900">{group.creator?.name || 'Unknown'}</p>
                  </div>

                  {group.tags && group.tags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {group.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;
