// Simple route -> dynamic import prefetch map
const routeMap = new Map([
  ["/dashboard", () => import("../pages/Dashboard")],
  ["/irrigation", () => import("../pages/IrrigationControl")],
  ["/analytics", () => import("../pages/Analytics")],
  ["/community", () => import("../pages/CommunityHub")],
  ["/community/discussions", () => import("../pages/Community")],
  ["/community/leaderboard", () => import("../pages/CommunityLeaderboard")],
  ["/community/groups", () => import("../pages/FarmerGroups")],
  ["/ai-assistant", () => import("../pages/AIAssistant")],
  ["/devices", () => import("../pages/DeviceConnection")],
  ["/shop", () => import("../pages/ShopDevices")],
  ["/admin/dashboard", () => import("../pages/AdminDashboard")],
  ["/admin/users", () => import("../pages/AdminUsers")],
  ["/admin/devices", () => import("../pages/AdminDevices")],
  ["/admin/map", () => import("../pages/AdminMapView")],
]);

export function prefetch(path) {
  const fn = routeMap.get(path);
  if (fn) {
    try {
      fn();
    } catch (e) {
      // ignore
    }
  }
}

export default prefetch;
