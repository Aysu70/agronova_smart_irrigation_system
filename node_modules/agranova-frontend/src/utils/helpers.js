// Format date to readable string
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format time ago
export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  
  return Math.floor(seconds) + ' seconds ago';
};

// Get status color
export const getStatusColor = (status) => {
  const colors = {
    ON: 'text-green-600 bg-green-100',
    OFF: 'text-gray-600 bg-gray-100',
    ACTIVE: 'text-green-600 bg-green-100',
    INACTIVE: 'text-gray-600 bg-gray-100',
    CHARGING: 'text-yellow-600 bg-yellow-100',
    INFO: 'text-blue-600 bg-blue-100',
    WARNING: 'text-yellow-600 bg-yellow-100',
    CRITICAL: 'text-red-600 bg-red-100',
  };
  return colors[status] || 'text-gray-600 bg-gray-100';
};

// Get moisture level description
export const getMoistureLevel = (value) => {
  if (value < 30) return { label: 'Low', color: 'text-red-600' };
  if (value < 60) return { label: 'Medium', color: 'text-yellow-600' };
  return { label: 'Good', color: 'text-green-600' };
};

// Get temperature status
export const getTemperatureStatus = (value) => {
  if (value < 15) return { label: 'Cold', color: 'text-blue-600' };
  if (value < 25) return { label: 'Optimal', color: 'text-green-600' };
  if (value < 35) return { label: 'Warm', color: 'text-yellow-600' };
  return { label: 'Hot', color: 'text-red-600' };
};

// Truncate text
export const truncate = (str, length = 100) => {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
};

// Validate email
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Generate avatar from name
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Get random color for avatars
export const getAvatarColor = (name) => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  const index = name ? name.charCodeAt(0) % colors.length : 0;
  return colors[index];
};

// Download data as JSON
export const downloadJSON = (data, filename) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

// Copy to clipboard
export const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
};
