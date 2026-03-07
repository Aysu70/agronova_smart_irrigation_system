import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Activity, AlertTriangle, CheckCircle, XCircle, Droplets, Thermometer, Battery } from 'lucide-react';
import { adminSystemAPI } from '../services/api';
import Layout from '../components/common/Layout';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom marker icons based on system health
const createMarkerIcon = (health, isSelected = false) => {
  const colors = {
    Normal: { bg: '#10b981', border: '#059669' },
    Warning: { bg: '#f59e0b', border: '#d97706' },
    Critical: { bg: '#ef4444', border: '#dc2626' },
    Unknown: { bg: '#6b7280', border: '#4b5563' }
  };

  const color = colors[health] || colors.Unknown;
  const size = isSelected ? 40 : 32;
  const pulse = health === 'Critical' ? 'animation: pulse 2s infinite;' : '';

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color.bg}; 
        width: ${size}px; 
        height: ${size}px; 
        border-radius: 50%; 
        border: 3px solid white; 
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ${pulse}
        ${isSelected ? 'box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.3);' : ''}
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 14px;
          font-weight: bold;
        ">
          ${health === 'Normal' ? '✓' : health === 'Critical' ? '!' : '⚠'}
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2]
  });
};

// Component to handle map view updates
function MapViewController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  return null;
}

const AdminMapView = () => {
  const navigate = useNavigate();
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]);
  const [mapZoom, setMapZoom] = useState(6);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchSystems();
    const interval = setInterval(fetchSystems, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystems = async () => {
    try {
      setError(null);
      const response = await adminSystemAPI.getAllSystems();
      if (response.data.success) {
        const systemsData = response.data.systems;
        setSystems(systemsData);
        
        if (systemsData.length > 0 && systemsData[0].location) {
          setMapCenter([
            systemsData[0].location.latitude,
            systemsData[0].location.longitude
          ]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch systems:', err);
      setError('Failed to load systems. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredSystems = systems.filter(system => {
    const matchesFilter = filter === 'all' || system.systemHealth === filter;
    const matchesSearch = 
      searchTerm === '' ||
      system.systemId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      system.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      system.region.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const handleMarkerClick = (system) => {
    setSelectedSystem(system);
    setMapCenter([system.location.latitude, system.location.longitude]);
    setMapZoom(13);
  };

  const handleSystemSelect = (system) => {
    setSelectedSystem(system);
    setMapCenter([system.location.latitude, system.location.longitude]);
    setMapZoom(13);
  };

  const formatDate = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const getStatusColor = (status) => {
    const colors = {
      Online: 'text-green-700 bg-green-100 border-green-200',
      Offline: 'text-gray-700 bg-gray-100 border-gray-200',
      Warning: 'text-yellow-700 bg-yellow-100 border-yellow-200',
      Critical: 'text-red-700 bg-red-100 border-red-200'
    };
    return colors[status] || colors.Offline;
  };

  const stats = {
    total: systems.length,
    normal: systems.filter(s => s.systemHealth === 'Normal').length,
    warning: systems.filter(s => s.systemHealth === 'Warning').length,
    critical: systems.filter(s => s.systemHealth === 'Critical').length
  };

  if (loading) {
    return (
      <Layout title="Map View">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <LoadingSpinner size="lg" message="Loading irrigation systems..." />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Map View">
        <ErrorMessage 
          title="Failed to Load Map" 
          message={error}
          onRetry={fetchSystems}
        />
      </Layout>
    );
  }

  return (
    <Layout title="Map View" showBreadcrumb={true}>
      <div className="space-y-4">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, owner, or region..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === 'all' 
                    ? 'bg-green-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All <span className="ml-1 font-bold">({stats.total})</span>
              </button>
              <button
                onClick={() => setFilter('Normal')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1 ${
                  filter === 'Normal' 
                    ? 'bg-green-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Normal ({stats.normal})</span>
              </button>
              <button
                onClick={() => setFilter('Warning')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1 ${
                  filter === 'Warning' 
                    ? 'bg-yellow-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Warning ({stats.warning})</span>
              </button>
              <button
                onClick={() => setFilter('Critical')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1 ${
                  filter === 'Critical' 
                    ? 'bg-red-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <XCircle className="w-4 h-4" />
                <span>Critical ({stats.critical})</span>
              </button>
            </div>
          </div>

          {/* Search Results Info */}
          {(searchTerm || filter !== 'all') && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredSystems.length}</span> of <span className="font-semibold">{systems.length}</span> systems
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-2 text-green-600 hover:text-green-700 font-medium"
                  >
                    Clear search
                  </button>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Map and System List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Map Container */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" style={{ height: '600px' }}>
              <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapViewController center={mapCenter} zoom={mapZoom} />
                
                {filteredSystems.map((system) => (
                  <Marker
                    key={system.systemId}
                    position={[system.location.latitude, system.location.longitude]}
                    icon={createMarkerIcon(system.systemHealth, selectedSystem?.systemId === system.systemId)}
                    eventHandlers={{
                      click: () => handleMarkerClick(system)
                    }}
                  >
                    <Popup>
                      <div className="p-2 min-w-[200px]">
                        <h3 className="font-bold text-gray-900 mb-2">{system.systemId}</h3>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Owner:</span>
                            <span className="font-medium text-gray-900">{system.ownerName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Region:</span>
                            <span className="font-medium text-gray-900">{system.region}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Status:</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(system.systemStatus)}`}>
                              {system.systemStatus}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Health:</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(system.systemHealth)}`}>
                              {system.systemHealth}
                            </span>
                          </div>
                          <div className="border-t pt-2 mt-2">
                            <button
                              onClick={() => handleSystemSelect(system)}
                              className="w-full px-3 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* System List / Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" style={{ height: '600px' }}>
              {selectedSystem ? (
                // System Details
                <div className="h-full overflow-y-auto p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">System Details</h3>
                    <button
                      onClick={() => setSelectedSystem(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* System ID */}
                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                      <p className="text-xs text-green-700 font-medium mb-1">SYSTEM ID</p>
                      <p className="text-xl font-bold text-green-900">{selectedSystem.systemId}</p>
                    </div>

                    {/* Owner & Region */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Owner</p>
                        <p className="font-semibold text-gray-900">{selectedSystem.ownerName}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Region</p>
                        <p className="font-semibold text-gray-900">{selectedSystem.region}</p>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${getStatusColor(selectedSystem.systemStatus)}`}>
                        {selectedSystem.systemStatus}
                      </span>
                      <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${getStatusColor(selectedSystem.systemHealth)}`}>
                        {selectedSystem.systemHealth}
                      </span>
                    </div>

                    {/* Sensor Readings */}
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                        <Activity className="w-4 h-4 mr-2 text-green-600" />
                        Sensor Readings
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <div className="flex items-center justify-between mb-1">
                            <Droplets className="w-4 h-4 text-blue-600" />
                            <p className="text-xs text-blue-700">Soil</p>
                          </div>
                          <p className="text-2xl font-bold text-blue-900">{selectedSystem.soilMoisture}%</p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                          <div className="flex items-center justify-between mb-1">
                            <Thermometer className="w-4 h-4 text-orange-600" />
                            <p className="text-xs text-orange-700">Temp</p>
                          </div>
                          <p className="text-2xl font-bold text-orange-900">{selectedSystem.temperature}°C</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                          <div className="flex items-center justify-between mb-1">
                            <Battery className="w-4 h-4 text-purple-600" />
                            <p className="text-xs text-purple-700">Battery</p>
                          </div>
                          <p className="text-2xl font-bold text-purple-900">{selectedSystem.batteryLevel}%</p>
                        </div>
                        <div className="bg-cyan-50 p-3 rounded-lg border border-cyan-200">
                          <div className="flex items-center justify-between mb-1">
                            <Droplets className="w-4 h-4 text-cyan-600" />
                            <p className="text-xs text-cyan-700">Tank</p>
                          </div>
                          <p className="text-2xl font-bold text-cyan-900">{selectedSystem.waterTankLevel}%</p>
                        </div>
                      </div>
                    </div>

                    {/* System Status */}
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">System Status</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-600">Pump</span>
                          <span className={`text-sm font-semibold ${selectedSystem.pumpStatus === 'ON' ? 'text-green-600' : 'text-gray-500'}`}>
                            {selectedSystem.pumpStatus}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-600">Solar</span>
                          <span className="text-sm font-semibold text-gray-900">{selectedSystem.solarStatus}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-600">Network</span>
                          <span className="text-sm font-semibold text-gray-900">{selectedSystem.networkStatus}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-600">Last Active</span>
                          <span className="text-sm font-semibold text-gray-900">{formatDate(selectedSystem.lastActive)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => navigate(`/admin/system/${selectedSystem.systemId}`)}
                      className="w-full mt-4 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
                    >
                      View Full Details
                    </button>
                  </div>
                </div>
              ) : (
                // System List
                <div className="h-full overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
                    <h3 className="text-lg font-bold text-gray-900">Systems</h3>
                    <p className="text-sm text-gray-600 mt-1">{filteredSystems.length} systems found</p>
                  </div>
                  <div className="p-2">
                    {filteredSystems.map((system) => (
                      <button
                        key={system.systemId}
                        onClick={() => handleSystemSelect(system)}
                        className="w-full text-left p-4 mb-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-all hover:shadow-md"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{system.systemId}</p>
                            <p className="text-xs text-gray-600">{system.ownerName}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(system.systemHealth)}`}>
                            {system.systemHealth}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {system.region}
                          </span>
                          <span>{formatDate(system.lastActive)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add pulse animation style */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
      `}</style>
    </Layout>
  );
};

export default AdminMapView;
