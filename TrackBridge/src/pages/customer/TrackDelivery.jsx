import { useState } from "react";
import { findByTrackingNumber } from "../../data/api";
import { PageHeader, Card, EmptyState } from "../../components/Ui";
import { Package } from "lucide-react";
import TrackingTimeline from "../../components/TrackingTimeline";
import { formatNaira } from "../../utils/currency";

export default function TrackDelivery() {
  const [value, setValue] = useState("");
  const [result, setResult] = useState(undefined);

  async function handleTrack(e) {
    e.preventDefault();
    if (!value.trim()) return;
    const found = await findByTrackingNumber(value);
    setResult(found);
  }

  return (
    <>
      <PageHeader title="Track a Delivery" subtitle="Look up proof of delivery by tracking number." />

      <Card>
        <form className="track-form" onSubmit={handleTrack}>
          <input
            type="text"
            placeholder="Enter tracking number, e.g. WB-38291"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <button className="btn btn-dark" type="submit">
            Track
          </button>
        </form>
      </Card>

      <Card>
        {result === undefined && (
          <EmptyState
            icon={Package}
            title="Track any of your deliveries"
            subtitle="Enter a tracking number above to see live status."
          />
        )}
        {result === null && (
          <EmptyState
            icon={Package}
            title="No delivery found"
            subtitle="Double-check the tracking number and try again."
          />
        )}
        {result && (
          <div className="tracking-result">
            <div className="tracking-result-header">
              <strong>{result.trackingNumber}</strong>
              <span className={`pill pill-${result.status}`}>{result.status.replace(/_/g, " ")}</span>
            </div>
            <TrackingTimeline currentStepIndex={2} />
            <div className="tracking-grid">
              <Field label="Item" value={result.item} />
              <Field label="Driver" value={result.driverName} />
              <Field label="Distance" value={`${result.distanceKm} km`} />
              <Field label="Delivery fee" value={formatNaira(result.fee)} />
            </div>
          </div>
        )}
      </Card>
    </>
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
