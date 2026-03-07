// Azerbaijan Regions in English
export const AZERBAIJAN_REGIONS = [
  { value: 'absheron', label: 'Absheron', coordinates: [40.4093, 49.8671] },
  { value: 'aran', label: 'Aran', coordinates: [40.5088, 47.1447] },
  { value: 'mountainous-shirvan', label: 'Mountainous Shirvan', coordinates: [40.8471, 48.6468] },
  { value: 'ganja-gazakh', label: 'Ganja-Gazakh', coordinates: [40.6828, 46.3606] },
  { value: 'quba-khachmaz', label: 'Quba-Khachmaz', coordinates: [41.3650, 48.5108] },
  { value: 'lankaran-astara', label: 'Lankaran-Astara', coordinates: [38.7542, 48.8509] },
  { value: 'shaki-zagatala', label: 'Shaki-Zagatala', coordinates: [41.1975, 46.6425] },
  { value: 'upper-karabakh', label: 'Upper Karabakh', coordinates: [39.7500, 46.7500] },
  { value: 'kalbajar-lachin', label: 'Kalbajar-Lachin', coordinates: [39.5500, 46.0367] },
  { value: 'east-zangezur', label: 'East Zangezur', coordinates: [39.2061, 46.4297] },
  { value: 'nakhchivan', label: 'Nakhchivan', coordinates: [39.2090, 45.4123] }
];

// Get region label by value
export const getRegionLabel = (value) => {
  const region = AZERBAIJAN_REGIONS.find(r => r.value === value);
  return region ? region.label : value;
};

// Get region coordinates by value
export const getRegionCoordinates = (value) => {
  const region = AZERBAIJAN_REGIONS.find(r => r.value === value);
  return region ? region.coordinates : null;
};
