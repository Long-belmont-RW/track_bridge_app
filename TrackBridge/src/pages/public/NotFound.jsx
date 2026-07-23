import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="status-page">
      <h1>404</h1>
      <p>This page doesn't exist, or has moved.</p>
      <Link to="/" className="btn btn-primary">
        Back to home
      </Link>
    </div>
  );
}
