import { Outlet } from "react-router-dom";
import { LayoutGrid, Package, MapPinned, Settings } from "lucide-react";
import Sidebar from "../components/Sidebar";

const NAV = [
  { to: "/customer", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/customer/deliveries", label: "My Deliveries", icon: Package },
  { to: "/customer/track", label: "Track a Delivery", icon: MapPinned },
  { to: "/customer/settings", label: "Settings", icon: Settings },
];

export default function CustomerLayout() {
  return (
    <div className="dashboard-shell">
      <Sidebar items={NAV} accountLabel="Customer" />
      <div className="dashboard-content">
        <Outlet />
      </div>
    </div>
  );
}
