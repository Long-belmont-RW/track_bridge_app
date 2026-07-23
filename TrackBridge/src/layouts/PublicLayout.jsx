import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, ShieldCheck, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

export default function PublicLayout() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAuthPage = ["/login", "/register"].some((p) => location.pathname.startsWith(p));

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="public-shell">
      {!isAuthPage && (
        <header className="public-header">
          <Link to="/" className="brand">
            <span className="brand-mark">
              <ShieldCheck size={17} strokeWidth={2.4} />
            </span>
            TrackBridge
          </Link>
          <nav className="public-nav">
            <NavLink to="/how-it-works" className={({ isActive }) => (isActive ? "nav-active" : "")}>
              How it works
            </NavLink>
            <NavLink to="/who-its-for" className={({ isActive }) => (isActive ? "nav-active" : "")}>
              Who it's for
            </NavLink>
            <NavLink to="/developers" className={({ isActive }) => (isActive ? "nav-active" : "")}>
              Developers
            </NavLink>
            <NavLink to="/track" className={({ isActive }) => (isActive ? "nav-active" : "")}>
              Track
            </NavLink>
          </nav>
          <div className="public-actions">
            <ThemeToggle variant="header" />
            {isAuthenticated ? (
              <Link className="btn btn-primary" to={`/${user.role}`}>
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link className="btn btn-ghost" to="/login">
                  Sign in
                </Link>
                <Link className="btn btn-primary" to="/register">
                  Get started
                </Link>
              </>
            )}
          </div>
          <button
            type="button"
            className="public-nav-toggle"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className={"public-mobile-menu" + (menuOpen ? " is-open" : "")}>
            <nav className="public-mobile-nav">
              <NavLink to="/how-it-works" className={({ isActive }) => (isActive ? "nav-active" : "")}>
                How it works
              </NavLink>
              <NavLink to="/who-its-for" className={({ isActive }) => (isActive ? "nav-active" : "")}>
                Who it's for
              </NavLink>
              <NavLink to="/developers" className={({ isActive }) => (isActive ? "nav-active" : "")}>
                Developers
              </NavLink>
              <NavLink to="/track" className={({ isActive }) => (isActive ? "nav-active" : "")}>
                Track
              </NavLink>
            </nav>
            <div className="public-mobile-actions">
              <div className="public-mobile-theme">
                <span className="muted">Appearance</span>
                <ThemeToggle variant="header" />
              </div>
              {isAuthenticated ? (
                <Link className="btn btn-primary btn-block" to={`/${user.role}`}>
                  Go to dashboard
                </Link>
              ) : (
                <>
                  <Link className="btn btn-outline btn-block" to="/login">
                    Sign in
                  </Link>
                  <Link className="btn btn-primary btn-block" to="/register">
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>
      )}
      <main>
        <Outlet />
      </main>
      {!isAuthPage && (
        <footer className="public-footer">
          <div>
            <strong>TrackBridge</strong>
            <div className="muted" style={{ marginTop: "0.4em" }}>
              © 2026 TrackBridge Logistics. Precise. Utilitarian. Verifiable.
            </div>
          </div>
          <div className="footer-links">
            <Link to="/how-it-works">How it works</Link>
            <Link to="/who-its-for">Who it's for</Link>
            <Link to="/developers">Developers</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </footer>
      )}
    </div>
  );
}
