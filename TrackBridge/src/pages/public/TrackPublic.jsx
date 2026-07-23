import { useState } from "react";
import { findByTrackingNumber } from "../../data/api";
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
    const found = await findByTrackingNumber(value);
    setResult(found);
    setLoading(false);
  }

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
            <strong>{result.trackingNumber}</strong>
            <span className="pill pill-delivered">Delivered</span>
          </div>

          <TrackingTimeline currentStepIndex={2} />

          <div className="tracking-grid">
            <Field label="Recipient" value={maskName(result.recipientName)} />
            <Field label="Address" value={result.address} />
            <Field label="Package" value={maskName(result.item)} />
            <Field label="Driver" value={result.driverName} />
            <Field label="Distance" value={`${result.distanceKm} km`} />
            <Field label="Delivery fee" value={formatNaira(result.fee)} />
          </div>

          <div className="proof-note">
            <CheckCircle2 size={15} /> Verified with 4 of 4 proof methods (2 required)
          </div>
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
