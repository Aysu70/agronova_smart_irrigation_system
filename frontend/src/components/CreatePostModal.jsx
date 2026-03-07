import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Image, Video, AlertCircle } from 'lucide-react';
import { PROBLEM_TYPES, getCategoriesForType } from '../utils/communityConstants';
import toast from 'react-hot-toast';

const CreatePostModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    problemType: '',
    category: '',
    tags: ''
  });

  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [availableCategories, setAvailableCategories] = useState([]);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Update categories when problem type changes
  useEffect(() => {
    if (formData.problemType) {
      const categories = getCategoriesForType(formData.problemType);
      setAvailableCategories(categories);
      
      // Reset category if it's not valid for the new problem type
      if (formData.category) {
        const isValidCategory = categories.some(cat => cat.value === formData.category);
        if (!isValidCategory) {
          setFormData(prev => ({ ...prev, category: '' }));
        }
      }
    } else {
      setAvailableCategories([]);
      setFormData(prev => ({ ...prev, category: '' }));
    }
  }, [formData.problemType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    // Validate file sizes
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Each image must be less than 5MB');
      return;
    }

    setImages(prev => [...prev, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (videos.length + files.length > 2) {
      toast.error('Maximum 2 videos allowed');
      return;
    }

    // Validate file sizes (max 50MB for videos)
    const oversizedFiles = files.filter(file => file.size > 50 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Each video must be less than 50MB');
      return;
    }

    setVideos(prev => [...prev, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
    setVideoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 5000) {
      newErrors.description = 'Description must be less than 5000 characters';
    }

    if (!formData.problemType) {
      newErrors.problemType = 'Problem type is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    const submitData = new FormData();
    submitData.append('title', formData.title.trim());
    submitData.append('description', formData.description.trim());
    submitData.append('problemType', formData.problemType);
    submitData.append('category', formData.category);
    submitData.append('tags', formData.tags);

    images.forEach(image => {
      submitData.append('images', image);
    });

    videos.forEach(video => {
      submitData.append('videos', video);
    });

    onSubmit(submitData);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      problemType: '',
      category: '',
      tags: ''
    });
    setImages([]);
    setVideos([]);
    setImagePreviews([]);
    setVideoPreviews([]);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Create New Post</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="What's your problem or question?"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.title
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-green-500'
              }`}
              maxLength={200}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.title}
              </p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              {formData.title.length}/200 characters
            </p>
          </div>

          {/* Problem Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Problem Type <span className="text-red-500">*</span>
            </label>
            <select
              name="problemType"
              value={formData.problemType}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.problemType
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-green-500'
              }`}
              disabled={isSubmitting}
            >
              <option value="">Select a problem type</option>
              {PROBLEM_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
            {errors.problemType && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.problemType}
              </p>
            )}
          </div>

          {/* Category (Dynamic based on problem type) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.category
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-green-500'
              }`}
              disabled={!formData.problemType || isSubmitting}
            >
              <option value="">
                {formData.problemType
                  ? 'Select a category'
                  : 'Select a problem type first'}
              </option>
              {availableCategories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.category}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide detailed information about your problem..."
              rows={6}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none ${
                errors.description
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-green-500'
              }`}
              maxLength={5000}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.description}
              </p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              {formData.description.length}/5000 characters
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (Optional)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="tomato, disease, organic (comma separated)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isSubmitting}
            />
            <p className="text-gray-500 text-sm mt-1">
              Separate tags with commas
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images (Max 5, 5MB each)
            </label>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              multiple
              onChange={handleImageSelect}
              className="hidden"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              disabled={isSubmitting || images.length >= 5}
            >
              <Image className="w-5 h-5" />
              Upload Images
            </button>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      disabled={isSubmitting}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Video Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Videos (Max 2, 50MB each)
            </label>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/mov,video/avi,video/mkv"
              multiple
              onChange={handleVideoSelect}
              className="hidden"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              disabled={isSubmitting || videos.length >= 2}
            >
              <Video className="w-5 h-5" />
              Upload Videos
            </button>

            {/* Video Previews */}
            {videoPreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                {videoPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <video
                      src={preview}
                      className="w-full h-40 object-cover rounded-lg"
                      controls
                    />
                    <button
                      type="button"
                      onClick={() => removeVideo(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      disabled={isSubmitting}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
