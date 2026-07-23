import { Outlet } from "react-router-dom";
import { LayoutGrid, PackageSearch, AlertTriangle, Users, Code2, CreditCard, Settings } from "lucide-react";
import Sidebar from "../components/Sidebar";
import TrialBanner from "../components/TrialBanner";

const NAV = [
  { to: "/company", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/company/deliveries", label: "Deliveries", icon: PackageSearch },
  { to: "/company/disputes", label: "Disputes", icon: AlertTriangle },
  { to: "/company/drivers", label: "Drivers", icon: Users },
  { to: "/company/integrations", label: "API & Integrations", icon: Code2 },
  { to: "/company/billing", label: "Billing & Plan", icon: CreditCard },
  { to: "/company/settings", label: "Settings", icon: Settings },
];

export default function CompanyLayout() {
  return (
    <div className="dashboard-shell">
      <Sidebar items={NAV} accountLabel="Company" />
      <div className="dashboard-content">
        <TrialBanner />
        <Outlet />
      </div>
    </div>
  );
}
