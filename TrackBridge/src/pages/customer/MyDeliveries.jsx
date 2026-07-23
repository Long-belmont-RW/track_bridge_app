import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { listDeliveries } from "../../data/api";
import { PageHeader, Card, EmptyState } from "../../components/Ui";
import { Package } from "lucide-react";
import { formatNaira } from "../../utils/currency";

export default function MyDeliveries() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    listDeliveries({ customerId: user.id }).then(setDeliveries);
  }, [user.id]);

  return (
    <>
      <PageHeader title="My Deliveries" subtitle="Everything headed your way." />
      <Card>
        {deliveries.length === 0 ? (
          <EmptyState icon={Package} title="No deliveries yet" subtitle="They'll show up here once created." />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Tracking #</th>
                <th>Item</th>
                <th>Company</th>
                <th>Fee</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((d) => (
                <tr key={d.id}>
                  <td>{d.trackingNumber}</td>
                  <td>{d.item}</td>
                  <td>{d.companyName}</td>
                  <td>{formatNaira(d.fee)}</td>
                  <td>
                    <span className={`pill pill-${d.status}`}>{d.status.replace(/_/g, " ")}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
