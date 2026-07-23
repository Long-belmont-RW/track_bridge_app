import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { listDeliveries, updateDeliveryStatus } from "../../data/api";
import { PageHeader, Card, EmptyState, Toast } from "../../components/Ui";
import { Package, Archive } from "lucide-react";
import useToast from "../../components/useToast";

export default function MyRoute() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const toast = useToast();

  async function refresh() {
    setDeliveries(await listDeliveries({ driverId: user.id }));
  }

  useEffect(() => {
    refresh();
  }, [user.id]);

  const openJobs = deliveries.filter((d) => ["assigned", "picked_up", "in_transit", "out_for_delivery"].includes(d.status));
  const completed = deliveries.filter((d) => d.status === "delivered");

  async function markDelivered(id) {
    await updateDeliveryStatus(id, "delivered");
    toast.show("Marked as delivered — proof of delivery saved.");
    refresh();
  }

  return (
    <>
      <PageHeader title="My Route" subtitle="Deliveries assigned to you." />

      <Card>
        <div className="card-header-row">
          <h3>Available to pick up</h3>
          <span className="count-badge">{openJobs.length}</span>
        </div>
        {openJobs.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No open jobs right now"
            subtitle="New unassigned deliveries from your company will show up here."
          />
        ) : (
          <ul className="stop-list">
            {openJobs.map((d) => (
              <li key={d.id} className="stop-row">
                <span>
                  <strong>{d.trackingNumber}</strong> — {d.address}
                </span>
                <button className="btn btn-outline btn-sm" onClick={() => markDelivered(d.id)}>
                  Mark delivered
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h3>Completed</h3>
        {completed.length === 0 ? (
          <EmptyState icon={Archive} title="Nothing delivered yet" subtitle="Completed stops will show up here." />
        ) : (
          <ul className="stop-list">
            {completed.map((d) => (
              <li key={d.id}>
                <strong>{d.trackingNumber}</strong> — {d.address}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Toast message={toast.message} tone={toast.tone} onClose={toast.close} />
    </>
  );
}
