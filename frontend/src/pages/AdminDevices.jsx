import React, { useState, useEffect } from "react";
import Layout from "../components/common/Layout";
import { adminAPI } from "../services/api";
import {
  AZERBAIJAN_REGIONS,
  getRegionCoordinates,
  getRegionLabel,
} from "../utils/constants";
import {
  Activity,
  Search,
  MapPin,
  Filter,
  Eye,
  Smartphone,
  Signal,
  SignalHigh,
  SignalLow,
  MapIcon,
  List,
  CheckCircle,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import DeferredMap from "../components/common/DeferredMap";
import { DEMO_USERS, DEMO_DEVICES, buildDemoDevices } from "../utils/demoData";

// Fix default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const AdminDevices = () => {
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'map'
  const [mapCenter, setMapCenter] = useState([40.4093, 49.8671]); // Baku center
  const [mapZoom, setMapZoom] = useState(7);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    offline: 0,
    maintenance: 0,
  });

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = devices;

    if (searchTerm) {
      filtered = filtered.filter(
        (d) =>
          d.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.ownerName.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((d) => d.status === statusFilter);
    }

    if (regionFilter !== "all") {
      filtered = filtered.filter((d) => d.region === regionFilter);
    }

    setFilteredDevices(filtered);
  }, [searchTerm, statusFilter, regionFilter, devices]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers();
      const users = response?.data?.data || [];

      // Prefer static DEMO_DEVICES if present (provides coordinates for map)
      let simulatedDevices = [];
      if (DEMO_DEVICES && DEMO_DEVICES.length > 0) {
        simulatedDevices = DEMO_DEVICES;
      } else if (users && users.length > 0) {
        simulatedDevices = buildDemoDevices(
          users,
          getRegionCoordinates,
          getRegionLabel,
        );
      } else {
        simulatedDevices = buildDemoDevices(
          DEMO_USERS,
          getRegionCoordinates,
          getRegionLabel,
        );
      }

      setDevices(simulatedDevices);
      setFilteredDevices(simulatedDevices);

      // Calculate stats
      setStats({
        total: simulatedDevices.length,
        active: simulatedDevices.filter((d) => d.status === "Active").length,
        offline: simulatedDevices.filter((d) => d.status === "Offline").length,
        maintenance: simulatedDevices.filter((d) => d.status === "Maintenance")
          .length,
      });
    } catch (error) {
      const simulatedDevices =
        DEMO_DEVICES && DEMO_DEVICES.length > 0
          ? DEMO_DEVICES
          : buildDemoDevices(DEMO_USERS, getRegionCoordinates, getRegionLabel);
      setDevices(simulatedDevices);
      setFilteredDevices(simulatedDevices);
      setStats({
        total: simulatedDevices.length,
        active: simulatedDevices.filter((d) => d.status === "Active").length,
        offline: simulatedDevices.filter((d) => d.status === "Offline").length,
        maintenance: simulatedDevices.filter((d) => d.status === "Maintenance")
          .length,
      });
      toast("Showing demo devices data", { icon: "🧪" });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Active":
        return <SignalHigh className="w-4 h-4" />;
      case "Offline":
        return <SignalLow className="w-4 h-4" />;
      case "Maintenance":
        return <Activity className="w-4 h-4" />;
      default:
        return <Signal className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700 border-green-300";
      case "Offline":
        return "bg-red-100 text-red-700 border-red-300";
      case "Maintenance":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const viewDeviceDetails = (device) => {
    setSelectedDevice(device);
    setShowModal(true);
  };

  const focusOnDeviceOnMap = (device) => {
    setViewMode("map");
    setMapCenter([device.location.lat, device.location.lng]);
    setMapZoom(12);
    setSelectedDevice(device);
  };

  if (loading) {
    return (
      <Layout title="Devices">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Devices">
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Smartphone className="w-8 h-8 mr-3 text-blue-600" />
            Device Management
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage all agricultural devices
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total Devices
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.total}
                </p>
                <p className="text-xs text-gray-500 mt-2">Registered devices</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.active}
                </p>
                <p className="text-xs text-gray-500 mt-2">Online now</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <SignalHigh className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Offline
                </p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.offline}
                </p>
                <p className="text-xs text-gray-500 mt-2">Need attention</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <SignalLow className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Maintenance
                </p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.maintenance}
                </p>
                <p className="text-xs text-gray-500 mt-2">Under service</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* View Toggle and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <List className="w-4 h-4 mr-2" />
                List View
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                  viewMode === "map"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <MapIcon className="w-4 h-4 mr-2" />
                Map View
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search devices or owners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Offline">Offline</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            {/* Region Filter */}
            <div>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Regions</option>
                {AZERBAIJAN_REGIONS.map((region) => (
                  <option key={region.value} value={region.value}>
                    {region.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content Area - List or Map */}
        {viewMode === "list" ? (
          /* Devices List */
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {filteredDevices.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Smartphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No devices found</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Device
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Signal
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Active
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDevices.map((device) => (
                      <tr
                        key={device.deviceId}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold mr-3">
                              {device.deviceId.split("-")[1]}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {device.deviceName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {device.deviceId}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {device.ownerName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {device.ownerEmail}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-700">
                            <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                            {device.location.address}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full border flex items-center w-fit ${getStatusColor(device.status)}`}
                          >
                            {getStatusIcon(device.status)}
                            <span className="ml-1">{device.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className={`h-2 rounded-full ${
                                  device.signalStrength > 70
                                    ? "bg-green-500"
                                    : device.signalStrength > 40
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                }`}
                                style={{ width: `${device.signalStrength}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600">
                              {device.signalStrength}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(device.lastActive)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => viewDeviceDetails(device)}
                              className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </button>
                            <button
                              onClick={() => focusOnDeviceOnMap(device)}
                              className="text-green-600 hover:text-green-700 font-medium flex items-center"
                            >
                              <MapPin className="w-4 h-4 mr-1" />
                              Map
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* Map View */
          <div
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            style={{ height: "600px" }}
          >
            <div className="h-full relative">
              {/* Map legend */}
              <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-[1000]">
                <h4 className="font-semibold text-gray-900 mb-2">Map Legend</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span>Active Device</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <span>Offline Device</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                    <span>Maintenance</span>
                  </div>
                </div>
              </div>

              <DeferredMap
                items={filteredDevices}
                getPosition={(d) => [d.location.lat, d.location.lng]}
                center={mapCenter}
                zoom={mapZoom}
                onMarkerClick={(d) => setSelectedDevice(d)}
                popupRenderer={(device) => (
                  <div className="p-2">
                    <h4 className="font-bold text-gray-900 mb-2">
                      {device.deviceName}
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">ID:</span>
                        <span className="font-medium">{device.deviceId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Owner:</span>
                        <span className="font-medium">{device.ownerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(device.status)}`}
                        >
                          {device.status}
                        </span>
                      </div>
                      <button
                        onClick={() => viewDeviceDetails(device)}
                        className="w-full mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                )}
                itemKey={(d) => d.deviceId}
                statusKey="status"
                statusColorMap={{
                  Active: { bg: "#10b981" },
                  Offline: { bg: "#ef4444" },
                  Maintenance: { bg: "#f59e0b" },
                }}
              />

              {/* Info box for selected device */}
              {selectedDevice && (
                <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-sm z-[1000]">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-gray-900">
                      {selectedDevice.deviceName}
                    </h4>
                    <button
                      onClick={() => setSelectedDevice(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">ID:</span>
                      <span className="font-medium">
                        {selectedDevice.deviceId}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Owner:</span>
                      <span className="font-medium">
                        {selectedDevice.ownerName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">
                        {selectedDevice.location.address}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedDevice.status)}`}
                      >
                        {selectedDevice.status}
                      </span>
                    </div>
                    <button
                      onClick={() => viewDeviceDetails(selectedDevice)}
                      className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      View Full Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary Footer */}
        <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
          <span>
            Showing {filteredDevices.length} of {devices.length} devices
          </span>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>

        {/* Device Details Modal */}
        {showModal && selectedDevice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Device Details
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Device ID</p>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedDevice.deviceId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(selectedDevice.status)}`}
                    >
                      {selectedDevice.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-2">
                      Device Information
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-700 block mb-1">Name:</span>
                        <span className="font-medium text-gray-900">
                          {selectedDevice.deviceName}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-700 block mb-1">Model:</span>
                        <span className="font-medium text-gray-900">
                          {selectedDevice.model}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-700 block mb-1">
                          Firmware:
                        </span>
                        <span className="font-medium text-gray-900">
                          {selectedDevice.firmware}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-700 block mb-1">
                          Signal:
                        </span>
                        <span className="font-medium text-gray-900">
                          {selectedDevice.signalStrength}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-2">
                      Owner Information
                    </p>
                    <p className="text-base font-medium text-gray-900">
                      {selectedDevice.ownerName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedDevice.ownerEmail}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-2">Location</p>
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-gray-400 mr-2 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedDevice.location.address}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Lat: {selectedDevice.location.lat.toFixed(4)}, Lng:{" "}
                          {selectedDevice.location.lng.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-2">Sensors</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center">
                        {selectedDevice.sensors.moisture ? (
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400 mr-2" />
                        )}
                        <span
                          className={
                            selectedDevice.sensors.moisture
                              ? "text-gray-900"
                              : "text-gray-400"
                          }
                        >
                          Moisture Sensor
                        </span>
                      </div>
                      <div className="flex items-center">
                        {selectedDevice.sensors.temperature ? (
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400 mr-2" />
                        )}
                        <span
                          className={
                            selectedDevice.sensors.temperature
                              ? "text-gray-900"
                              : "text-gray-400"
                          }
                        >
                          Temperature Sensor
                        </span>
                      </div>
                      <div className="flex items-center">
                        {selectedDevice.sensors.humidity ? (
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400 mr-2" />
                        )}
                        <span
                          className={
                            selectedDevice.sensors.humidity
                              ? "text-gray-900"
                              : "text-gray-400"
                          }
                        >
                          Humidity Sensor
                        </span>
                      </div>
                      <div className="flex items-center">
                        {selectedDevice.sensors.light ? (
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400 mr-2" />
                        )}
                        <span
                          className={
                            selectedDevice.sensors.light
                              ? "text-gray-900"
                              : "text-gray-400"
                          }
                        >
                          Light Sensor
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-2">Activity</p>
                    <p className="font-medium text-gray-900">
                      Last Active: {formatDate(selectedDevice.lastActive)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => focusOnDeviceOnMap(selectedDevice)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  View on Map
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDevices;
