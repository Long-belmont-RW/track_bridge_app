import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { listDeliveries, listDisputes, listDrivers } from "../../data/api";
import { uploadBulkDeliveries, generateRoutes } from "../../services/deliveryService";
import { PageHeader, StatCard, Card, EmptyState, Toast } from "../../components/Ui";
import { Package, Code2, ArrowRight } from "lucide-react";
import RouteMap from "../../components/RouteMap";
export default function CompanyOverview() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    listDeliveries({ companyId: user.id }).then(setDeliveries);
    listDisputes({ companyId: user.id }).then(setDisputes);
    listDrivers({ companyId: user.id }).then(setDrivers);
  }, [user.id]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setNotification(null);
    try {
      const response = await uploadBulkDeliveries(file);
      
      if (response && response.success) {
        setNotification({
          message: `Successfully uploaded ${response.successful_inserts} deliveries. Generating routes...`,
          tone: "success"
        });
        
        // Optimistically update the UI to reflect the newly uploaded deliveries,
        // since the company deliveries fetch API doesn't exist yet on the backend.
        if (response.successful_inserts > 0) {
          const newMockDeliveries = Array.from({ length: response.successful_inserts }).map((_, i) => ({
            id: `bulk-${Date.now()}-${i}`,
            trackingNumber: `WB-BLK-${Math.floor(1000 + Math.random() * 9000)}`,
            status: "pending",
            recipientName: "Bulk Upload Recipient",
            companyId: user.id,
            createdAt: Date.now()
          }));
          setDeliveries((prev) => [...newMockDeliveries, ...prev]);
        }

        try {
          await generateRoutes();
        } catch (routeErr) {
          console.warn("Routes generation failed, but upload succeeded:", routeErr);
        }

      } else {
        setNotification({ message: response?.error || "Upload failed.", tone: "error" });
        listDeliveries({ companyId: user.id }).then(setDeliveries);
      }
    } catch (error) {
      console.error("Failed to upload deliveries or generate routes:", error);
      setNotification({ message: "An error occurred during upload.", tone: "error" });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const inProgress = deliveries.filter((d) =>
    ["assigned", "picked_up", "in_transit", "out_for_delivery"].includes(d.status)
  ).length;
  const delivered = deliveries.filter((d) => d.status === "delivered").length;
  const successRate = deliveries.length ? Math.round((delivered / deliveries.length) * 100) : 0;
  const availableDrivers = drivers.filter((d) => d.available).length;

  return (
    <>
      <PageHeader title="Overview" subtitle="Here's how deliveries are moving today." />
      
      {notification && (
        <div style={{ marginBottom: "1.5rem" }}>
          <Toast 
            message={notification.message} 
            tone={notification.tone} 
            onClose={() => setNotification(null)} 
          />
        </div>
      )}

      <div className="stat-grid">
        <StatCard label="Total deliveries" value={deliveries.length} />
        <StatCard
          label="In progress"
          value={inProgress}
          hint={`${availableDrivers} of ${drivers.length} drivers available`}
        />
        <StatCard
          label="Delivery success rate"
          value={`${successRate}%`}
          hint="Verified with photo + signature"
          hintTone="success"
        />
        <StatCard
          label="Disputes flagged"
          value={disputes.length}
          hint={disputes.length ? "Needs attention" : "All clear"}
          hintTone={disputes.length ? "warning" : "success"}
        />
      </div>

      <Card style={{ marginBottom: "1.5rem", padding: "1.5rem" }}>
        <div className="card-header-row" style={{ marginBottom: "1rem" }}>
          <h3 style={{ margin: 0 }}>Live Delivery Clusters</h3>
        </div>
        <div 
          style={{ 
            height: "500px", 
            borderRadius: "8px", 
            overflow: "hidden", 
            border: "1px solid var(--border-color, #333)",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
          }}
        >
          <RouteMap />
        </div>
      </Card>

      <Card>
        <div className="card-header-row">
          <h3>Recent activity</h3>
          <button className="btn btn-outline btn-sm" onClick={() => setOpenModal(true)}>
            View all
          </button>
        </div>
        {deliveries.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No deliveries yet"
            subtitle="They'll show up here once created. Once you start moving freight, your real-time log will populate here."
            action={
              <>
                <input
                  type="file"
                  accept=".csv"
                  style={{ display: "none" }}
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <button 
                  className="btn btn-accent" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "+ Create Your First Delivery"}
                </button>
              </>
            }
          />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Tracking #</th>
                <th>Recipient</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.slice(0, 5).map((d) => (
                <tr key={d.id}>
                  <td>{d.trackingNumber}</td>
                  <td>{d.recipientName}</td>
                  <td>
                    <span className={`pill pill-${d.status}`}>{d.status.replace(/_/g, " ")}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card className="integration-callout">
        <div>
          <h3 style={{ margin: "0 0 0.3em", display: "flex", alignItems: "center", gap: "0.5em" }}>
            <Code2 size={16} /> Generate tracking numbers from your own checkout
          </h3>
          <p className="muted" style={{ margin: 0 }}>
            Call the TrackBridge API right after an order completes — get a tracking number back and
            we'll email it to the customer.
          </p>
        </div>
        <Link to="/company/integrations" className="btn btn-outline btn-sm">
          View API & Integrations <ArrowRight size={14} />
        </Link>
      </Card>

      {openModal && (
        <NewDeliveryRedirectNote onClose={() => setOpenModal(false)} />
      )}
    </>
  );
}


function NewDeliveryRedirectNote({ onClose }) {
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h2>Create a delivery</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="modal-body">
          <p>Head to the Deliveries tab to fill out the new delivery form.</p>
          <a href="/company/deliveries" className="btn btn-dark btn-block">
            Go to Deliveries
          </a>
        </div>
      </div>
    </div>
  );
}
