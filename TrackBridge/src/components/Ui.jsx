import { X } from "lucide-react";

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="subtitle">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, hint, hintTone = "neutral" }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {hint && <div className={`stat-hint tone-${hintTone}`}>{hint}</div>}
    </div>
  );
}


export function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="empty-state">
      {Icon && (
        <div className="empty-icon" aria-hidden="true">
          <Icon size={26} strokeWidth={1.6} />
        </div>
      )}
      <div className="empty-title">{title}</div>
      {subtitle && <div className="empty-subtitle">{subtitle}</div>}
      {action}
    </div>
  );
}

export function Card({ children, className = "" }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function Toast({ message, tone = "success", onClose }) {
  if (!message) return null;
  return (
    <div className={`toast tone-${tone}`} role="status">
      {message}
      <button className="toast-close" onClick={onClose} aria-label="Dismiss">
        <X size={15} />
      </button>
    </div>
  );
}

export function StatusPill({ status, label }) {
  return <span className={`pill pill-${status}`}>{label}</span>;
}
