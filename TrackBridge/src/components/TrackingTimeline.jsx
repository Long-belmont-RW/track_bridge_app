const STEPS = ["Order placed", "Out for delivery", "Delivered"];

export default function TrackingTimeline({ currentStepIndex = 0 }) {
  return (
    <div className="timeline">
      {STEPS.map((step, i) => (
        <div key={step} className={"timeline-step" + (i <= currentStepIndex ? " done" : "")}>
          <span className="timeline-dot" />
          <span className="timeline-label">{step}</span>
          {i < STEPS.length - 1 && <span className="timeline-line" />}
        </div>
      ))}
    </div>
  );
}
