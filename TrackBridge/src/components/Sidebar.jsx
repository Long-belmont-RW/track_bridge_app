import { useState } from "react";
import { NavLink } from "react-router-dom";
import { LogOut, Menu, ShieldCheck, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

export default function Sidebar({ items, accountLabel }) {
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const initials = (user?.name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className={"sidebar" + (mobileOpen ? " sidebar-mobile-open" : "")}>
      <div className="sidebar-top-row">
        <div className="sidebar-brand">
          <span className="brand-mark">
            <ShieldCheck size={16} strokeWidth={2.4} />
          </span>
          TrackBridge
        </div>
        <button
          type="button"
          className="sidebar-mobile-toggle"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className={"sidebar-nav" + (mobileOpen ? " is-open" : "")}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
            >
              <span className="sidebar-icon" aria-hidden="true">
                <Icon size={17} strokeWidth={2} />
              </span>
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className={"sidebar-footer" + (mobileOpen ? " is-open" : "")}>
        <div className="sidebar-user">
          <span className="avatar">{initials}</span>
          <div>
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{accountLabel}</div>
          </div>
        </div>
        <div className="sidebar-footer-actions">
          <ThemeToggle variant="sidebar" />
          <button className="btn btn-outline btn-block" onClick={signOut}>
            <LogOut size={15} /> <span className="btn-label">Log out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
