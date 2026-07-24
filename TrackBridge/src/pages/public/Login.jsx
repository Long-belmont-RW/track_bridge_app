import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowLeft, ArrowRight, Lock } from "lucide-react";
import RoleTabs from "../../components/RoleTabs";
import { useAuth } from "../../context/AuthContext";
import { login } from "../../services/authService";

export default function Login() {
  const [role, setRole] = useState("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogin(e) {
    e.preventDefault();
    if (!email || !password) {
      setError("Enter your email address and password.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const user = await login(email, password);
      const appRole = user?.user_metadata?.role || (user?.role !== 'authenticated' ? user?.role : null) || role;
      
      // Update global context state with the authenticated user
      await signIn(user || { role: appRole, email });
      
      const redirectTo = location.state?.from?.pathname || `/${appRole}`;
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogle() {
    setIsLoading(true);
    await signIn({ role, email: "you@gmail.com" });
    setIsLoading(false);
    navigate(`/${role}`, { replace: true });
  }

  return (
    <div className="auth-page">
      <Link to="/" className="back-link">
        <ArrowLeft size={14} /> Back to home
      </Link>

      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark-box"><ShieldCheck size={19} strokeWidth={2.4} /></span> TrackBridge
        </div>
        <h1>Welcome back</h1>
        <p className="subtitle center">Enter your credentials to access the logistics dashboard.</p>

        <RoleTabs value={role} onChange={setRole} />

        <form onSubmit={handleLogin} className="auth-form">
          <label className="field">
            <span>
              Email address <em>Required</em>
            </span>
            <input
              type="email"
              placeholder={role === "company" ? "name@company.com" : "you@example.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="field">
            <span>
              Password <Link to="/forgot-password">Forgot?</Link>
            </span>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <div className="form-error">{error}</div>}

          <button className="btn btn-dark btn-block" type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : (<>Sign in to dashboard <ArrowRight size={15} /></>)}
          </button>
        </form>

        <div className="divider">or continue with</div>

        <button className="btn btn-outline btn-block" onClick={handleGoogle} disabled={isLoading}>
          <span aria-hidden="true">G</span> Sign in with Google
        </button>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>

        <div className="auth-meta">
          <span><Lock size={12} /> SSL Encryption Active</span>
          <span>v2.4.0 Stable</span>
          <span>© 2026 TrackBridge Logistics. Precise. Utilitarian. Verifiable.</span>
        </div>
      </div>
    </div>
  );
}
