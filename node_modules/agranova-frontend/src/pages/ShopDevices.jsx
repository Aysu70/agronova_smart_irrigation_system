import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { DEMO_DEVICES, DEMO_ORDERS } from "../utils/demoData";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";
import {
  ShoppingCart,
  Check,
  Star,
  Package,
  Zap,
  Droplet,
  X,
  Loader as LoaderIcon,
  Filter,
  MapPin,
  TrendingUp,
  Award,
  Clock,
  Users,
  Leaf,
  Settings,
  Sun,
  Target,
  ArrowRight,
  Info,
  CheckCircle,
  AlertCircle,
  Maximize,
} from "lucide-react";
import { toast } from "react-hot-toast";
import DeferredMap from "../components/common/DeferredMap";
import Loader from "../components/common/Loader";

// Map is lazy-loaded to speed navigation
// Cleaned: rewrite to remove potential hidden/invalid tokens

const AZERBAIJAN_REGIONS = [
  "All Regions",
  "Absheron",
  "Baku",
  "Ganja",
  "Lankaran",
  "Sheki",
  "Shirvan",
  "Sumgait",
  "Guba",
  "Mingachevir",
  "Nakhchivan",
];

const DEVICE_TYPES = [
  "All Types",
  "complete-system",
  "irrigation-controller",
  "sensor-kit",
  "pump-system",
];

const COVERAGE_RANGES = [
  { label: "All Coverage", value: null },
  { label: "Small (0-1 ha)", value: { min: 0, max: 1 } },
  { label: "Medium (1-3 ha)", value: { min: 1, max: 3 } },
  { label: "Large (3-5 ha)", value: { min: 3, max: 5 } },
  { label: "Extra Large (5+ ha)", value: { min: 5, max: 1000 } },
];

const ShopDevices = () => {
  const { user } = useAuth();

  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    deviceType: "All Types",
    minPrice: "",
    maxPrice: "",
    coverage: null,
    inStockOnly: false,
  });
  const [popularDevices, setPopularDevices] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [recommendForm, setRecommendForm] = useState({
    region: "",
    farmSize: "",
    budget: "",
  });
  const [recommendedDevice, setRecommendedDevice] = useState(null);
  const [ordering, setOrdering] = useState(false);

  const [orderForm, setOrderForm] = useState({
    quantity: 1,
    paymentMethod: "card",
    shippingAddress: {
      region: "",
      city: "",
      address: "",
      zipCode: "",
      phone: "",
    },
    notes: "",
  });

  useEffect(() => {
    fetchDevices();
    fetchPopularDevices();
    fetchRecentOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, devices]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await api.get("/devices");
      const devicesData = response?.data?.data || DEMO_DEVICES || [];
      setDevices(devicesData);
      setFilteredDevices(devicesData);
    } catch (error) {
      console.error("Error fetching devices:", error);
      // fallback to demo devices so the shop remains usable
      setDevices(DEMO_DEVICES || []);
      setFilteredDevices(DEMO_DEVICES || []);
      toast.error("Unable to load devices from server — showing demo devices.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularDevices = async () => {
    try {
      const response = await api.get("/devices");
      const list = response?.data?.data || DEMO_DEVICES || [];
      const sorted = (Array.isArray(list) ? list : [])
        .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
        .slice(0, 3);
      setPopularDevices(sorted);
    } catch (error) {
      console.error("Error fetching popular devices:", error);
      setPopularDevices((DEMO_DEVICES || []).slice(0, 3));
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await api.get("/orders");
      const orders = response?.data?.data || DEMO_ORDERS || [];
      setRecentOrders(Array.isArray(orders) ? orders.slice(0, 5) : []);
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      setRecentOrders((DEMO_ORDERS || []).slice(0, 5));
    }
  };

  const applyFilters = () => {
    let filtered = [...devices];

    // Filter by device type
    if (filters.deviceType !== "All Types") {
      filtered = filtered.filter((d) => d.category === filters.deviceType);
    }

    // Filter by price range
    if (filters.minPrice) {
      filtered = filtered.filter(
        (d) => d.price >= parseFloat(filters.minPrice),
      );
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(
        (d) => d.price <= parseFloat(filters.maxPrice),
      );
    }

    // Filter by coverage (extract from specifications.coverage)
    if (filters.coverage) {
      filtered = filtered.filter((d) => {
        const coverage = d.specifications?.coverage || "";
        const match = coverage.match(/(\d+)/);
        if (match) {
          const hectares = parseFloat(match[1]);
          return (
            hectares >= filters.coverage.min && hectares <= filters.coverage.max
          );
        }
        return true;
      });
    }

    // Filter by stock
    if (filters.inStockOnly) {
      filtered = filtered.filter((d) => d.inStock);
    }

    setFilteredDevices(filtered);
  };

  const getSmartRecommendation = () => {
    const { region, farmSize, budget } = recommendForm;

    if (!farmSize) {
      toast.error("Please enter your farm size");
      return;
    }

    const size = parseFloat(farmSize);
    const budgetNum = budget ? parseFloat(budget) : Infinity;

    let recommended = null;

    // Rule-based recommendation logic
    if (size <= 1) {
      // Small farm - recommend basic or sensor kit
      recommended = devices.find(
        (d) =>
          d.category === "irrigation-controller" &&
          d.price <= budgetNum &&
          d.inStock,
      );
    } else if (size <= 3) {
      // Medium farm - recommend sensor kit or pump system
      recommended = devices.find(
        (d) =>
          (d.category === "sensor-kit" || d.category === "pump-system") &&
          d.price <= budgetNum &&
          d.inStock,
      );
    } else if (size <= 5) {
      // Large farm - recommend complete system
      recommended = devices.find(
        (d) =>
          d.category === "complete-system" && d.price <= budgetNum && d.inStock,
      );
    } else {
      // Extra large farm - recommend pro complete system
      recommended = devices.find(
        (d) =>
          d.category === "complete-system" && d.price <= budgetNum && d.inStock,
      );
    }

    if (!recommended) {
      // Fallback - just get best match by price
      recommended = devices
        .filter((d) => d.inStock && d.price <= budgetNum)
        .sort((a, b) => b.rating - a.rating)[0];
    }

    if (recommended) {
      setRecommendedDevice(recommended);
      toast.success("Found the perfect system for your farm!");
    } else {
      toast.error("No suitable system found. Try adjusting your budget.");
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      "irrigation-controller": "Irrigation Controller",
      "sensor-kit": "Sensor Kit",
      "pump-system": "Pump System",
      "complete-system": "Complete System",
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category) => {
    const colors = {
      "irrigation-controller": "bg-blue-100 text-blue-800",
      "sensor-kit": "bg-green-100 text-green-800",
      "pump-system": "bg-purple-100 text-purple-800",
      "complete-system": "bg-orange-100 text-orange-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const handleOrderClick = (device) => {
    setSelectedDevice(device);
    setShowOrderModal(true);
    setOrderForm({
      quantity: 1,
      paymentMethod: "card",
      shippingAddress: {
        region: user?.region || "",
        city: "",
        address: "",
        zipCode: "",
        phone: "",
      },
      notes: "",
    });
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();

    if (
      !orderForm.shippingAddress.region ||
      !orderForm.shippingAddress.city ||
      !orderForm.shippingAddress.address ||
      !orderForm.shippingAddress.phone
    ) {
      toast.error("Please fill in all shipping details");
      return;
    }

    try {
      setOrdering(true);
      await api.post("/orders", {
        deviceId: selectedDevice._id || selectedDevice.deviceId,
        quantity: orderForm.quantity,
        shippingAddress: orderForm.shippingAddress,
        paymentMethod: orderForm.paymentMethod,
        notes: orderForm.notes,
      });

      toast.success("Order placed successfully!");
      setShowOrderModal(false);
      setSelectedDevice(null);
      fetchDevices(); // Refresh to update stock
      fetchRecentOrders(); // Update recent orders
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setOrdering(false);
    }
  };

  const totalPrice =
    selectedDevice && orderForm.quantity
      ? (selectedDevice.price * orderForm.quantity).toFixed(2)
      : "0.00";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="ml-64">
          <Navbar title="Shop Devices" />
          <div className="flex items-center justify-center h-screen">
            <LoaderIcon className="w-12 h-12 text-green-600 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <Navbar title="Shop Devices" />
        <div className="p-8 mt-16">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Smart Irrigation Devices
            </h1>
            <p className="text-gray-600">
              Browse and order professional irrigation systems for your farm
            </p>
          </div>

          {/* Smart Recommendation Tool */}
          <div className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Find Your Perfect System
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Tell us about your farm and we'll recommend the best
                  irrigation system
                </p>

                {!showRecommendation ? (
                  <button
                    onClick={() => setShowRecommendation(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Get Recommendation
                  </button>
                ) : (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Your Region
                        </label>
                        <select
                          value={recommendForm.region}
                          onChange={(e) =>
                            setRecommendForm({
                              ...recommendForm,
                              region: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        >
                          <option value="">Select region</option>
                          {AZERBAIJAN_REGIONS.filter(
                            (r) => r !== "All Regions",
                          ).map((region) => (
                            <option key={region} value={region}>
                              {region}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Farm Size (hectares) *
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={recommendForm.farmSize}
                          onChange={(e) =>
                            setRecommendForm({
                              ...recommendForm,
                              farmSize: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                          placeholder="e.g., 2.5"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Budget (USD)
                        </label>
                        <input
                          type="number"
                          value={recommendForm.budget}
                          onChange={(e) =>
                            setRecommendForm({
                              ...recommendForm,
                              budget: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={getSmartRecommendation}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Find System
                      </button>
                      <button
                        onClick={() => {
                          setShowRecommendation(false);
                          setRecommendedDevice(null);
                          setRecommendForm({
                            region: "",
                            farmSize: "",
                            budget: "",
                          });
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>

                    {recommendedDevice && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start gap-4">
                          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-1">
                              {recommendedDevice.name}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {recommendedDevice.description}
                            </p>
                            <div className="flex items-center gap-4">
                              <span className="text-lg font-bold text-green-600">
                                $
                                {recommendedDevice.price?.toLocaleString?.() ||
                                  "N/A"}
                              </span>
                              <button
                                onClick={() => {
                                  setSelectedDevice(recommendedDevice);
                                  setShowDetailsModal(true);
                                }}
                                className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                              >
                                View Details <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content - 3 Column Layout */}
          <div className="grid grid-cols-12 gap-6">
            {/* LEFT: Filter Panel */}
            <div className="col-span-3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 sticky top-24">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </h3>

                {/* Device Type */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Device Type
                  </label>
                  <select
                    value={filters.deviceType}
                    onChange={(e) =>
                      setFilters({ ...filters, deviceType: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  >
                    {DEVICE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {getCategoryLabel(type)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range (USD)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) =>
                        setFilters({ ...filters, minPrice: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        setFilters({ ...filters, maxPrice: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Coverage Area */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coverage Area
                  </label>
                  <div className="space-y-2">
                    {COVERAGE_RANGES.map((range) => (
                      <label
                        key={range.label}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="coverage"
                          checked={filters.coverage?.label === range.label}
                          onChange={() =>
                            setFilters({ ...filters, coverage: range.value })
                          }
                          className="text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">
                          {range.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* In Stock Only */}
                <div className="mb-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.inStockOnly}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          inStockOnly: e.target.checked,
                        })
                      }
                      className="rounded text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">In Stock Only</span>
                  </label>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={() =>
                    setFilters({
                      region: "All Regions",
                      deviceType: "All Types",
                      minPrice: "",
                      maxPrice: "",
                      coverage: null,
                      inStockOnly: false,
                    })
                  }
                  className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            </div>

            {/* CENTER: Devices Grid */}
            <div className="col-span-6">
              <div className="mb-4 text-sm text-gray-600">
                Showing {filteredDevices.length} of {devices.length} devices
              </div>

              {filteredDevices.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No devices found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filters
                  </p>
                  <button
                    onClick={() =>
                      setFilters({
                        region: "All Regions",
                        deviceType: "All Types",
                        minPrice: "",
                        maxPrice: "",
                        coverage: null,
                        inStockOnly: false,
                      })
                    }
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDevices.map((device) => (
                    <div
                      key={device._id || device.deviceId}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                    >
                      <div className="flex">
                        {/* Device Image */}
                        <div className="w-48 flex-shrink-0 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center relative">
                          <Package className="w-20 h-20 text-white opacity-30" />
                          <button
                            onClick={() => {
                              setSelectedDevice(device);
                              setShowDetailsModal(true);
                            }}
                            className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                          >
                            <Maximize className="w-4 h-4 text-gray-700" />
                          </button>
                        </div>

                        {/* Device Content */}
                        <div className="flex-1 p-5">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <span
                                className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getCategoryColor(device.category)}`}
                              >
                                {getCategoryLabel(device.category)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              <span className="text-sm font-medium text-gray-900">
                                {device.rating}
                              </span>
                              <span className="text-sm text-gray-500">
                                ({device.reviewCount})
                              </span>
                            </div>
                          </div>

                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {device.name}
                          </h3>
                          <p className="text-sm text-gray-500 mb-3">
                            Model: {device.model}
                          </p>

                          <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                            {device.description}
                          </p>

                          {/* Features */}
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            {(device.features || [])
                              .slice(0, 4)
                              .map((feature, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 text-xs text-gray-600"
                                >
                                  <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                                  <span className="truncate">{feature}</span>
                                </div>
                              ))}
                          </div>

                          {/* Specs */}
                          <div className="flex items-center gap-4 mb-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Droplet className="w-4 h-4 text-blue-600" />
                              <span className="text-gray-600">
                                {device.specifications?.coverage || "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-yellow-600" />
                              <span className="text-gray-600">
                                {device.specifications?.solarPower || "N/A"}
                              </span>
                            </div>
                          </div>

                          {/* Price and Actions */}
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-2xl font-bold text-gray-900">
                                ${device?.price?.toLocaleString?.() || "N/A"}
                              </span>
                              <div className="text-sm">
                                {device.inStock ? (
                                  <span className="text-green-600 font-medium">
                                    In Stock ({device.stockQuantity})
                                  </span>
                                ) : (
                                  <span className="text-red-600 font-medium">
                                    Out of Stock
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleOrderClick(device)}
                              disabled={!device.inStock}
                              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                                device.inStock
                                  ? "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg"
                                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                              }`}
                            >
                              <ShoppingCart className="w-5 h-5" />
                              Order Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Recommendations Panel */}
            <div className="col-span-3">
              <div className="space-y-5 sticky top-24">
                {/* Popular Devices */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Popular
                  </h3>
                  <div className="space-y-3">
                    {popularDevices.slice(0, 3).map((device) => (
                      <div
                        key={device._id || device.deviceId}
                        className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedDevice(device);
                          setShowDetailsModal(true);
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Award className="w-4 h-4 text-yellow-500" />
                          <h4 className="font-semibold text-sm text-gray-900 truncate">
                            {device.name}
                          </h4>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">
                            ★ {device.rating || 0} ({device.reviewCount || 0})
                          </span>
                          <span className="font-bold text-green-600">
                            ${device?.price?.toLocaleString?.() || "N/A"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Orders */}
                {recentOrders.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      Recent Orders
                    </h3>
                    <div className="space-y-3">
                      {recentOrders.slice(0, 5).map((order) => (
                        <div
                          key={order._id}
                          className="p-3 bg-gray-50 rounded-lg text-xs"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="w-3 h-3 text-gray-500" />
                            <span className="font-medium text-gray-900 truncate">
                              {order.userName || "Customer"}
                            </span>
                          </div>
                          <p className="text-gray-600 truncate mb-1">
                            {order.deviceName}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">
                              {order.shippingAddress?.region || "Azerbaijan"}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                order.status === "delivered"
                                  ? "bg-green-100 text-green-700"
                                  : order.status === "processing"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Why Choose Us */}
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-5 border border-green-200">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-green-600" />
                    Why Choose Us?
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Professional installation support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>1-year warranty on all devices</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Free delivery across Azerbaijan</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>24/7 technical support</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Device Details Modal */}
      {showDetailsModal && selectedDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {selectedDevice.name}
                  </h2>
                  <p className="text-gray-600">Model: {selectedDevice.model}</p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedDevice(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Left: Image and Quick Info */}
                <div>
                  <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg h-64 flex items-center justify-center mb-4">
                    <Package className="w-32 h-32 text-white opacity-30" />
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${getCategoryColor(selectedDevice.category)}`}
                      >
                        {getCategoryLabel(selectedDevice.category)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        <span className="font-bold text-gray-900">
                          {selectedDevice.rating}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({selectedDevice.reviewCount} reviews)
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900">
                        ${selectedDevice?.price?.toLocaleString?.() || "N/A"}
                      </span>
                      <span className="text-gray-500 ml-2">
                        {selectedDevice.currency}
                      </span>
                    </div>

                    <div className="mb-4">
                      {selectedDevice.inStock ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">
                            In Stock ({selectedDevice.stockQuantity} available)
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-600">
                          <AlertCircle className="w-5 h-5" />
                          <span className="font-medium">Out of Stock</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleOrderClick(selectedDevice);
                      }}
                      disabled={!selectedDevice.inStock}
                      className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                        selectedDevice.inStock
                          ? "bg-green-600 text-white hover:bg-green-700 shadow-md"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {selectedDevice.inStock ? "Order Now" : "Out of Stock"}
                    </button>
                  </div>
                </div>

                {/* Right: Details */}
                <div>
                  {/* Description */}
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <Info className="w-5 h-5 text-blue-600" />
                      Description
                    </h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {selectedDevice?.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-900 mb-3">
                      Key Features
                    </h3>
                    <div className="space-y-2">
                      {(selectedDevice.features || []).map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-900 mb-3">
                      Technical Specifications
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Droplet className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-medium text-blue-900">
                            Water Capacity
                          </span>
                        </div>
                        <p className="text-sm text-blue-800">
                          {selectedDevice.specifications?.waterCapacity ||
                            "N/A"}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium text-green-900">
                            Coverage
                          </span>
                        </div>
                        <p className="text-sm text-green-800">
                          {selectedDevice.specifications?.coverage || "N/A"}
                        </p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Sun className="w-4 h-4 text-yellow-600" />
                          <span className="text-xs font-medium text-yellow-900">
                            Solar Power
                          </span>
                        </div>
                        <p className="text-sm text-yellow-800">
                          {selectedDevice.specifications?.solarPower || "N/A"}
                        </p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Settings className="w-4 h-4 text-purple-600" />
                          <span className="text-xs font-medium text-purple-900">
                            Connectivity
                          </span>
                        </div>
                        <p className="text-sm text-purple-800">
                          {selectedDevice.specifications?.connectivity || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Installation Map Info */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-900 mb-1">
                          Available Across Azerbaijan
                        </h4>
                        <p className="text-sm text-green-800">
                          We provide installation and support services in all
                          regions including Baku, Ganja, Sheki, Lankaran, and
                          more.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {showOrderModal && selectedDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Complete Your Order
                  </h2>
                  <p className="text-gray-600">{selectedDevice.name}</p>
                </div>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleOrderSubmit} className="space-y-6">
                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedDevice.stockQuantity}
                    value={orderForm.quantity}
                    onChange={(e) =>
                      setOrderForm({
                        ...orderForm,
                        quantity: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Shipping Address
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Region *
                      </label>
                      <input
                        type="text"
                        value={orderForm.shippingAddress.region}
                        onChange={(e) =>
                          setOrderForm({
                            ...orderForm,
                            shippingAddress: {
                              ...orderForm.shippingAddress,
                              region: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={orderForm.shippingAddress.city}
                        onChange={(e) =>
                          setOrderForm({
                            ...orderForm,
                            shippingAddress: {
                              ...orderForm.shippingAddress,
                              city: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm text-gray-700 mb-1">
                        Address *
                      </label>
                      <input
                        type="text"
                        value={orderForm.shippingAddress.address}
                        onChange={(e) =>
                          setOrderForm({
                            ...orderForm,
                            shippingAddress: {
                              ...orderForm.shippingAddress,
                              address: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Zip Code
                      </label>
                      <input
                        type="text"
                        value={orderForm.shippingAddress.zipCode}
                        onChange={(e) =>
                          setOrderForm({
                            ...orderForm,
                            shippingAddress: {
                              ...orderForm.shippingAddress,
                              zipCode: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        value={orderForm.shippingAddress.phone}
                        onChange={(e) =>
                          setOrderForm({
                            ...orderForm,
                            shippingAddress: {
                              ...orderForm.shippingAddress,
                              phone: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={orderForm.paymentMethod}
                    onChange={(e) =>
                      setOrderForm({
                        ...orderForm,
                        paymentMethod: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="card">Credit/Debit Card</option>
                    <option value="bank-transfer">Bank Transfer</option>
                    <option value="cash-on-delivery">Cash on Delivery</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    value={orderForm.notes}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, notes: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="Any special delivery instructions..."
                  />
                </div>

                {/* Total Price */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Unit Price:</span>
                    <span className="text-gray-900">
                      ${selectedDevice?.price?.toLocaleString?.() || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Quantity:</span>
                    <span className="text-gray-900">{orderForm.quantity}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">
                        Total:
                      </span>
                      <span className="text-2xl font-bold text-green-600">
                        ${totalPrice}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={ordering}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {ordering ? (
                      <>
                        <LoaderIcon className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Place Order
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOrderModal(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopDevices;
