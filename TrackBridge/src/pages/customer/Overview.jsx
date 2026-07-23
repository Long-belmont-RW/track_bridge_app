import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { listDeliveries } from "../../data/api";
import { PageHeader, StatCard, Card, EmptyState } from "../../components/Ui";
import { Mail } from "lucide-react";

export default function CustomerOverview() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    listDeliveries({ customerId: user.id }).then(setDeliveries);
  }, [user.id]);

  const active = deliveries.filter((d) => !["delivered", "cancelled"].includes(d.status)).length;
  const delivered = deliveries.filter((d) => d.status === "delivered").length;

  return (
    <>
      <PageHeader title="Overview" subtitle="Your delivery activity." />

      <div className="stat-grid">
        <StatCard label="Active shipments" value={active} />
        <StatCard label="Delivered" value={delivered} />
        <StatCard label="Total shipments" value={deliveries.length} />
        <StatCard label="Saved address" value={user.deliveryAddress ? "1" : "—"} />
      </div>

      <Card>
        <div className="card-header-row">
          <h3>Your shipments</h3>
          <Link to="/customer/deliveries" className="btn btn-outline btn-sm">
            View all
          </Link>
        </div>
        {deliveries.length === 0 ? (
          <EmptyState icon={Mail} title="No deliveries yet" subtitle="They'll show up here once created." />
        ) : (
          <DeliveryList rows={deliveries.slice(0, 5)} />
        )}
      </Card>
    </>
  );
}

function DeliveryList({ rows }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Tracking #</th>
          <th>Item</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((d) => (
          <tr key={d.id}>
            <td>{d.trackingNumber}</td>
            <td>{d.item}</td>
            <td>
              <span className={`pill pill-${d.status}`}>{d.status.replace(/_/g, " ")}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
