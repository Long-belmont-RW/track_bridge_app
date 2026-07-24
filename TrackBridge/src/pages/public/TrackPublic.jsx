import { useState } from "react";
import { getPublicTracking } from "../../services/deliveryService";
import TrackingTimeline from "../../components/TrackingTimeline";
import { formatNaira } from "../../utils/currency";
import { EmptyState } from "../../components/Ui";
import { Package, CheckCircle2 } from "lucide-react";

export default function TrackPublic() {
  const [value, setValue] = useState("");
  const [result, setResult] = useState(undefined); // undefined = not searched yet
  const [loading, setLoading] = useState(false);

  async function handleTrack(e) {
    e.preventDefault();
    if (!value.trim()) return;
    setLoading(true);
    setResult(undefined);
    try {
      const response = await getPublicTracking(value.trim());
      if (response && response.data) {
        setResult(response.data);
      } else {
        setResult(null);
      }
    } catch (err) {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  const getStepIndex = (status) => {
    switch(status) {
      case 'pending': return 0;
      case 'assigned': return 1;
      case 'in_transit': return 2;
      case 'delivered': return 3;
      default: return 0;
    }
  };

  return (
    <div className="track-page">
      <h1>Track a delivery</h1>
      <p className="subtitle">
        Sent to your email right after checkout — paste it below to follow your delivery. No
        account needed.
      </p>

      <form className="track-form" onSubmit={handleTrack}>
        <input
          type="text"
          placeholder="WB-38291"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label="Tracking number"
        />
        <button className="btn btn-dark" type="submit" disabled={loading}>
          {loading ? "Tracking…" : "Track"}
        </button>
      </form>

      {result === null && (
        <div className="card">
          <EmptyState
            icon={Package}
            title="No delivery found"
            subtitle="Double-check the tracking number and try again."
          />
        </div>
      )}

      {result && (
        <div className="card tracking-result">
          <div className="tracking-result-header">
            <strong>{result.tracking_number}</strong>
            <span className={`pill pill-${result.status === 'delivered' ? 'delivered' : 'pending'}`}>
              {result.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <TrackingTimeline currentStepIndex={getStepIndex(result.status)} />

          <div className="tracking-grid">
            <Field label="Recipient" value={maskName(result.recipient_name)} />
            <Field label="Address" value={result.recipient_address} />
            <Field label="Driver" value={result.routes?.driver ? `${result.routes.driver.first_name || ''} ${result.routes.driver.last_name || ''}`.trim() : "Pending"} />
          </div>
          
          {result.status === 'delivered' && result.proof_of_delivery_photo_url && (
            <div className="proof-of-delivery-container" style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '10px' }}>Proof of Delivery</h4>
              <img 
                src={result.proof_of_delivery_photo_url} 
                alt="Proof of Delivery" 
                style={{ width: '100%', maxWidth: '300px', borderRadius: '8px', border: '1px solid #e5e7eb' }} 
              />
              <div className="proof-note" style={{ marginTop: '10px' }}>
                <CheckCircle2 size={15} /> Delivered at {new Date(result.delivered_at).toLocaleString()}
              </div>
            </div>
          )}

          {result.status !== 'delivered' && (
            <div className="proof-note">
              <CheckCircle2 size={15} /> Your delivery is verified securely.
            </div>
          )}
        </div>
      )}

      {result === undefined && (
        <p className="track-hint muted">
          Once your delivery arrives, you'll be able to rate the driver or report a problem right
          on this page.
        </p>
      )}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="field-readout">
      <span className="field-label">{label}</span>
      <span className="field-value">{value}</span>
    </div>
  );
}

function maskName(name = "") {
  return name
    .split(" ")
    .map((part) => (part.length > 1 ? part[0] + "*".repeat(part.length - 1) : part))
    .join(" ");
}
