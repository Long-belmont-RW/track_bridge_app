import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { listDisputes } from "../../data/api";
import { PageHeader, Card, EmptyState } from "../../components/Ui";
import { AlertTriangle } from "lucide-react";

export default function Disputes() {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState([]);

  useEffect(() => {
    listDisputes({ companyId: user.id }).then(setDisputes);
  }, [user.id]);

  return (
    <>
      <PageHeader title="Disputes" subtitle="Delivery disputes flagged by customers." />
      <Card>
        {disputes.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="No disputes"
            subtitle="Flagged deliveries will show up here the moment a customer reports a problem."
          />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Tracking #</th>
                <th>Reason</th>
                <th>Raised by</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {disputes.map((d) => (
                <tr key={d.id}>
                  <td>{d.trackingNumber}</td>
                  <td>{d.reason}</td>
                  <td>{d.raisedBy}</td>
                  <td>
                    <span className="pill pill-disputed">{d.status}</span>
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
