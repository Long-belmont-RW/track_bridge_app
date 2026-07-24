import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { PageHeader, StatCard, Card, EmptyState } from "../../components/Ui";
import { Package } from "lucide-react";
import RouteMap from "../../components/RouteMap";

export default function DriverOverview() {
  const { user } = useAuth();
  const [available, setAvailable] = useState(false);
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    async function fetchRoutes() {
      try {
        const response = await api.get('/drivers/my-routes');
        const routes = response.data.data || [];
        const allDeliveries = routes.flatMap(r => r.deliveries || []);
        setDeliveries(allDeliveries);
      } catch (error) {
        console.error('Failed to fetch driver routes:', error);
      }
    }
    fetchRoutes();
  }, [user.id]);

  const remaining = deliveries.filter((d) => !["delivered", "cancelled", "failed"].includes(d.status)).length;
  const completed = deliveries.filter((d) => d.status === "delivered").length;

  return (
    <>
      <PageHeader title="Overview" subtitle="Today's route at a glance." />

      <Card style={{ padding: 0, overflow: 'hidden', height: '400px', marginBottom: '24px' }}>
        <RouteMap deliveries={deliveries} />
      </Card>

      <Card>
        <div className="availability-row">
          <div>
            <strong>Availability</strong>
            <p className="muted">Go available to be assigned new deliveries, or to pick up open jobs yourself.</p>
          </div>
          <button
            className={"btn " + (available ? "btn-online" : "btn-outline")}
            onClick={() => setAvailable((a) => !a)}
          >
            <span className={"status-dot" + (available ? " on" : "")} /> {available ? "Available" : "Offline — go available"}
          </button>
        </div>
      </Card>

      <div className="stat-grid">
        <StatCard label="Assigned total" value={deliveries.length} />
        <StatCard label="Remaining stops" value={remaining} />
        <StatCard label="Completed" value={completed} hint="Verified with proof" hintTone="success" />
        <StatCard label="Vehicle" value={user.vehicle || "—"} />
      </div>

      <Card>
        <div className="card-header-row">
          <h3>Next stops</h3>
          <a href="/driver/route" className="btn btn-outline btn-sm">
            Open route
          </a>
        </div>
        {deliveries.length === 0 ? (
          <EmptyState icon={Package} title="No deliveries yet" subtitle="They'll show up here once created." />
        ) : (
          <ul className="stop-list">
            {deliveries.slice(0, 5).map((d) => (
              <li key={d.id}>
                <strong>{d.tracking_number}</strong> — {d.recipient_address}
                <div style={{ fontSize: '0.85em', color: '#666', marginTop: '4px' }}>
                  {d.recipient_name} • {d.recipient_phone || 'No phone'}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="stat-grid two-col">
        <StatCard label="Available to pick up" value={0} />
        <StatCard label="New assignments" value={0} />
      </div>
    </>
  );
}
