import { Link } from "react-router-dom";
import { AlertTriangle, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getBillingState } from "../utils/billing";

export default function TrialBanner() {
  const { user } = useAuth();
  const { status, daysLeft } = getBillingState(user);

  if (status === "none" || status === "active") return null;

  if (status === "expired") {
    return (
      <div className="trial-banner trial-banner-expired">
        <AlertTriangle size={16} />
        <span>
          Your free trial has ended. Subscribe to keep creating deliveries and generating tracking
          numbers.
        </span>
        <Link to="/company/billing" className="btn btn-dark btn-sm">
          Subscribe now
        </Link>
      </div>
    );
  }

  return (
    <div className="trial-banner">
      <Clock size={16} />
      <span>
        {daysLeft === 1 ? "1 day left" : `${daysLeft} days left`} in your free trial.
      </span>
      <Link to="/company/billing" className="btn btn-outline btn-sm">
        Add payment method
      </Link>
    </div>
  );
}
