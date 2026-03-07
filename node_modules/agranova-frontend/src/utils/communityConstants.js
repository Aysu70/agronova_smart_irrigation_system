// Problem Types and Dynamic Categories Configuration
export const PROBLEM_TYPES = [
  { value: 'crop-health', label: 'Crop Health', icon: '🌾', color: 'green' },
  { value: 'irrigation', label: 'Irrigation', icon: '💧', color: 'blue' },
  { value: 'soil-fertility', label: 'Soil & Fertility', icon: '🌱', color: 'brown' },
  { value: 'equipment-tech', label: 'Equipment & Technology', icon: '⚙️', color: 'purple' },
  { value: 'weather-climate', label: 'Weather & Climate', icon: '🌤️', color: 'yellow' },
  { value: 'harvesting', label: 'Harvesting', icon: ' 🚜', color: 'orange' },
  { value: 'general', label: 'General Question', icon: '💬', color: 'gray' },
  { value: 'other', label: 'Other', icon: '📝', color: 'slate' }
];

export const CATEGORIES_BY_TYPE = {
  'crop-health': [
    { value: 'plant-disease', label: 'Plant Disease' },
    { value: 'pests', label: 'Pests' },
    { value: 'nutrient-deficiency', label: 'Nutrient Deficiency' },
    { value: 'leaf-problems', label: 'Leaf Problems' },
    { value: 'root-problems', label: 'Root Problems' }
  ],
  'irrigation': [
    { value: 'overwatering', label: 'Overwatering' },
    { value: 'underwatering', label: 'Underwatering' },
    { value: 'drip-system', label: 'Drip System Issue' },
    { value: 'water-quality', label: 'Water Quality' },
    { value: 'scheduling', label: 'Scheduling Issue' }
  ],
  'soil-fertility': [
    { value: 'soil-ph', label: 'Soil pH' },
    { value: 'fertilization', label: 'Fertilization' },
    { value: 'soil-structure', label: 'Soil Structure' },
    { value: 'organic-matter', label: 'Organic Matter' },
    { value: 'compaction', label: 'Soil Compaction' }
  ],
  'equipment-tech': [
    { value: 'sensor-issue', label: 'Sensor Issue' },
    { value: 'device-malfunction', label: 'Device Not Working' },
    { value: 'calibration', label: 'Calibration Problem' },
    { value: 'app-integration', label: 'App Integration' },
    { value: 'connectivity', label: 'Connectivity Issue' }
  ],
  'weather-climate': [
    { value: 'frost-damage', label: 'Frost Damage' },
    { value: 'heat-stress', label: 'Heat Stress' },
    { value: 'drought', label: 'Drought' },
    { value: 'storm-damage', label: 'Storm Damage' },
    { value: 'flooding', label: 'Flooding' }
  ],
  'harvesting': [
    { value: 'timing', label: 'Timing Issue' },
    { value: 'yield-loss', label: 'Yield Loss' },
    { value: 'storage', label: 'Storage Problem' },
    { value: 'quality', label: 'Quality Issue' },
    { value: 'post-harvest', label: 'Post-Harvest Care' }
  ],
  'general': [
    { value: 'farming-advice', label: 'Farming Advice' },
    { value: 'best-practices', label: 'Best Practices' },
    { value: 'recommendations', label: 'Recommendations' },
    { value: 'crop-selection', label: 'Crop Selection' },
    { value: 'planning', label: 'Planning & Strategy' }
  ],
  'other': [
    { value: 'uncategorized', label: 'Uncategorized' },
    { value: 'suggestion', label: 'Suggestion/Feedback' },
    { value: 'discussion', label: 'General Discussion' }
  ]
};

// Get categories for a specific problem type
export const getCategoriesForType = (problemType) => {
  return CATEGORIES_BY_TYPE[problemType] || [];
};

// Get problem type config by value
export const getProblemType = (value) => {
  return PROBLEM_TYPES.find(type => type.value === value);
};

// Get category label by value and type
export const getCategoryLabel = (problemType, categoryValue) => {
  const categories = CATEGORIES_BY_TYPE[problemType] || [];
  const category = categories.find(cat => cat.value === categoryValue);
  return category?.label || categoryValue;
};

// Color palette for UI
export const COLOR_CLASSES = {
  green: 'bg-green-100 text-green-700 border-green-200',
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  brown: 'bg-amber-100 text-amber-700 border-amber-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  gray: 'bg-gray-100 text-gray-700 border-gray-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200'
};

export const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent', icon: 'Clock' },
  { value: 'popular', label: 'Most Popular', icon: 'TrendingUp' },
  { value: 'discussed', label: 'Most Discussed', icon: 'MessageCircle' }
];
