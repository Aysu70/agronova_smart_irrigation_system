import React, { useState } from 'react';
import { Heart, MessageCircle, Eye, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { getProblemType, getCategoryLabel, COLOR_CLASSES } from '../utils/communityConstants';

const PostCard = ({ post, onLike, onComment, onDelete, onEdit, currentUserId }) => {
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const problemType = getProblemType(post.problemType);
  const categoryLabel = getCategoryLabel(post.problemType, post.category);
  const isAuthor = currentUserId && currentUserId === post.authorId;
  const isLiked = post.isLikedByUser || false;

  const formatDate = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return postDate.toLocaleDateString();
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      await onComment(post._id, commentText);
      setCommentText('');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg">
            {post.authorName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{post.authorName}</h3>
            <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
          </div>
        </div>

        {isAuthor && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                <button
                  onClick={() => {
                    onEdit(post);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-50 transition"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Post
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this post?')) {
                      onDelete(post._id);
                    }
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Problem Type & Category Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        {problemType && (
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${
              COLOR_CLASSES[problemType.color]
            }`}
          >
            <span>{problemType.icon}</span>
            <span>{problemType.label}</span>
          </span>
        )}
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
          {categoryLabel}
        </span>
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold text-gray-800 mb-3">{post.title}</h2>

      {/* Description */}
      <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.description}</p>

      {/* Images */}
      {post.media?.images?.length > 0 && (
        <div className={`grid gap-2 mb-4 ${
          post.media.images.length === 1 ? 'grid-cols-1' :
          post.media.images.length === 2 ? 'grid-cols-2' :
          'grid-cols-3'
        }`}>
          {post.media.images.map((image, index) => (
            <img
              key={index}
              src={`http://localhost:5001${image.url}`}
              alt={`Post attachment ${index + 1}`}
              className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
              onClick={() => window.open(`http://localhost:5001${image.url}`, '_blank')}
            />
          ))}
        </div>
      )}

      {/* Videos */}
      {post.media?.videos?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          {post.media.videos.map((video, index) => (
            <video
              key={index}
              src={`http://localhost:5001${video.url}`}
              controls
              className="w-full h-64 object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center gap-6 pt-4 border-t">
        <button
          onClick={() => onLike(post._id)}
          className={`flex items-center gap-2 transition ${
            isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          <span className="font-medium">{post.likeCount || 0}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">{post.commentCount || 0}</span>
        </button>

        <div className="flex items-center gap-2 text-gray-600">
          <Eye className="w-5 h-5" />
          <span className="font-medium">{post.views || 0}</span>
        </div>

        {post.status && (
          <span
            className={`ml-auto text-sm px-3 py-1 rounded-full ${
              post.status === 'answered'
                ? 'bg-green-100 text-green-700'
                : post.status === 'closed'
                ? 'bg-gray-100 text-gray-700'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
          </span>
        )}
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t space-y-4">
          {/* Comment Input */}
          {currentUserId && (
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={isSubmittingComment}
                maxLength={1000}
              />
              <button
                type="submit"
                disabled={isSubmittingComment || !commentText.trim()}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingComment ? 'Posting...' : 'Post'}
              </button>
            </form>
          )}

          {/* Comments List */}
          {post.comments && post.comments.length > 0 ? (
            <div className="space-y-3">
              {post.comments.map((comment) => (
                <div key={comment._id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {comment.authorName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-800 text-sm">
                        {comment.authorName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;
