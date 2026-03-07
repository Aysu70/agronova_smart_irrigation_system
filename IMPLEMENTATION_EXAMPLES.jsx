/**
 * AGRANOVA - Page Update Quick Guide
 * 
 * This file shows EXACTLY how to update existing pages to use
 * the new responsive Layout with proper error handling.
 * 
 * Copy-paste these patterns into your pages.
 */

// ============================================================================
// EXAMPLE 1: SIMPLE DATA PAGE (Dashboard, Analytics, etc.)
// ============================================================================

import React, { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Droplets, Thermometer, Activity } from 'lucide-react';
import { sensorAPI } from '../services/api';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      const response = await sensorAPI.getLatest();
      setData(response.data.data);
    } catch (err) {
      setError('Failed to load sensor data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Layout title="Dashboard">
        <LoadingSpinner size="lg" message="Loading dashboard data..." />
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout title="Dashboard">
        <ErrorMessage 
          title="Dashboard Error" 
          message={error}
          onRetry={fetchData}
          type="error"
        />
      </Layout>
    );
  }

  // Main content
  return (
    <Layout title="Dashboard" showBreadcrumb={false}>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Droplets className="w-8 h-8 text-blue-600" />
              <span className="text-sm text-gray-500">Soil Moisture</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{data?.soilMoisture || 0}%</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Thermometer className="w-8 h-8 text-orange-600" />
              <span className="text-sm text-gray-500">Temperature</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{data?.temperature || 0}°C</p>
          </div>

          {/* More cards... */}
        </div>

        {/* More sections... */}
      </div>
    </Layout>
  );
};

export default Dashboard;

// ============================================================================
// EXAMPLE 2: PAGE WITH SEARCH & FILTERS (Systems, Alerts, etc.)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage, EmptyState } from '../components/common/ErrorMessage';
import { Search, Filter } from 'lucide-react';
import { adminSystemAPI } from '../services/api';

const SystemsPage = () => {
  const navigate = useNavigate();
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchSystems();
  }, []);

  const fetchSystems = async () => {
    try {
      setError(null);
      const response = await adminSystemAPI.getAllSystems();
      setSystems(response.data.systems);
    } catch (err) {
      setError('Failed to load systems');
    } finally {
      setLoading(false);
    }
  };

  const filteredSystems = systems.filter(system => {
    const matchesSearch = searchTerm === '' || 
      system.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || 
      system.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <Layout title="Systems">
        <LoadingSpinner size="lg" message="Loading systems..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Systems">
        <ErrorMessage 
          title="Failed to Load Systems" 
          message={error}
          onRetry={fetchSystems}
        />
      </Layout>
    );
  }

  return (
    <Layout title="Systems" showBreadcrumb={true}>
      <div className="space-y-6">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search systems..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === 'all' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('Online')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === 'Online' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Online
              </button>
              {/* More filters... */}
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredSystems.length === 0 ? (
          <EmptyState 
            title="No Systems Found"
            message="Try adjusting your search or filters"
            action={() => { setSearchTerm(''); setStatusFilter('all'); }}
            actionLabel="Clear Filters"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSystems.map((system) => (
              <div 
                key={system.id}
                onClick={() => navigate(`/admin/system/${system.id}`)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{system.name}</h3>
                <p className="text-sm text-gray-600">{system.description}</p>
                <div className="mt-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    {system.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SystemsPage;

// ============================================================================
// EXAMPLE 3: FORM PAGE (Settings, Irrigation Control, etc.)
// ============================================================================

import React, { useState } from 'react';
import Layout from '../components/common/Layout';
import { Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { irrigationAPI } from '../services/api';

const IrrigationControl = () => {
  const [mode, setMode] = useState('auto');
  const [threshold, setThreshold] = useState(30);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await irrigationAPI.updateConfig({ mode, threshold });
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="Irrigation Control" showBreadcrumb={true}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Info Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">About Irrigation Control</h3>
            <p className="text-sm text-blue-700 mt-1">
              Configure your irrigation system's behavior. Changes take effect immediately.
            </p>
          </div>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">System Configuration</h2>
            
            {/* Mode Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Irrigation Mode
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setMode('auto')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    mode === 'auto'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900">Automatic</div>
                  <div className="text-sm text-gray-600 mt-1">Based on sensors</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setMode('manual')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    mode === 'manual'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900">Manual</div>
                  <div className="text-sm text-gray-600 mt-1">Control manually</div>
                </button>
              </div>
            </div>

            {/* Threshold Slider */}
            {mode === 'auto' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moisture Threshold: {threshold}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Dry (10%)</span>
                  <span>Wet (80%)</span>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default IrrigationControl;

// ============================================================================
// COMMON PATTERNS REFERENCE
// ============================================================================

/*

1. LOADING STATE PATTERN
=========================
if (loading) {
  return (
    <Layout title="Page Title">
      <LoadingSpinner size="lg" message="Loading..." />
    </Layout>
  );
}

2. ERROR STATE PATTERN
=======================
if (error) {
  return (
    <Layout title="Page Title">
      <ErrorMessage 
        title="Error Title" 
        message={error}
        onRetry={fetchData}
      />
    </Layout>
  );
}

3. EMPTY STATE PATTERN
=======================
{data.length === 0 && (
  <EmptyState 
    title="No Data"
    message="No items found"
    action={refresh}
    actionLabel="Refresh"
  />
)}

4. CARD LAYOUT
==============
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
  {/* content */}
</div>

5. BUTTON STYLES
================
Primary:
className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"

Secondary:
className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"

Danger:
className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"

6. STATUS BADGES
================
Online/Success:
className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200"

Warning:
className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200"

Error/Critical:
className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200"

7. SEARCH INPUT
===============
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
  <input
    type="text"
    placeholder="Search..."
    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
  />
</div>

8. GRID LAYOUTS
===============
4 columns (stats):
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"

3 columns (cards):
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

2 columns (forms):
className="grid grid-cols-1 md:grid-cols-2 gap-6"

*/
