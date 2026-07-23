import { Outlet } from "react-router-dom";
import { LayoutGrid, Truck, Settings } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/driver", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/driver/route", label: "My Route", icon: Truck },
  { to: "/driver/settings", label: "Settings", icon: Settings },
];

export default function DriverLayout() {
  const { user } = useAuth();
  return (
    <div className="dashboard-shell">
      <Sidebar items={NAV} accountLabel={`Driver • #${user?.id?.slice(-6) || "4402-B"}`} />
      <div className="dashboard-content">
        <Outlet />
      </div>
    </div>
  );
}
