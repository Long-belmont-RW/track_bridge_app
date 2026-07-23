import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Forbidden() {
  const { user } = useAuth();
  return (
    <div className="status-page">
      <h1>403</h1>
      <p>Your account doesn't have access to that area.</p>
      {user && (
        <Link to={`/${user.role}`} className="btn btn-primary">
          Go to your dashboard
        </Link>
      )}
    </div>
  );
}
