import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { PageHeader, Card, EmptyState, Toast } from "../../components/Ui";
import { Package, Archive, Camera, Upload, X } from "lucide-react";
import RouteMap from "../../components/RouteMap";
import useToast from "../../components/useToast";

export default function MyRoute() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [activeStop, setActiveStop] = useState(null);
  const [podFile, setPodFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();

  async function refresh() {
    try {
      const response = await api.get('/drivers/my-routes');
      const routes = response.data.data || [];
      const allDeliveries = routes.flatMap(r => r.deliveries || []);
      setDeliveries(allDeliveries);
    } catch (error) {
      console.error('Failed to fetch routes', error);
      toast.show("Failed to load your routes", "error");
    }
  }

  useEffect(() => {
    refresh();
  }, [user.id]);

  const openJobs = deliveries.filter((d) => !["delivered", "cancelled", "failed"].includes(d.status));
  const completed = deliveries.filter((d) => d.status === "delivered");

  const handleCompleteDelivery = async (e) => {
    e.preventDefault();
    if (!podFile) {
      toast.show("Please take or upload a photo.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Build FormData
      const formData = new FormData();
      formData.append('status', 'delivered');
      formData.append('signature_url', 'Verified via Mobile');
      formData.append('photo', podFile);

      // 2. Patch backend
      await api.patch(`/deliveries/${activeStop.id}/complete`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.show("Delivery completed successfully!", "success");
      setActiveStop(null);
      setPodFile(null);
      refresh();
    } catch (error) {
      console.error('Failed to complete delivery:', error);
      toast.show(error.message || "Failed to complete delivery.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="My Route" subtitle="Deliveries assigned to you." />

      <Card style={{ padding: 0, overflow: 'hidden', height: '400px', marginBottom: '24px' }}>
        <RouteMap deliveries={deliveries} />
      </Card>

      <Card>
        <div className="card-header-row">
          <h3>Available Stops</h3>
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
              <li key={d.id} className="stop-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <div>
                    <strong>{d.tracking_number}</strong> — {d.recipient_address}
                    <div style={{ fontSize: '0.85em', color: '#666', marginTop: '4px' }}>
                      {d.recipient_name} • {d.recipient_phone || 'No phone'}
                    </div>
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={() => setActiveStop(d)}>
                    Complete
                  </button>
                </div>
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
                <strong>{d.tracking_number}</strong> — {d.recipient_address}
                {d.proof_of_delivery_photo_url && (
                  <div style={{ marginTop: '8px' }}>
                    <a href={d.proof_of_delivery_photo_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.8em', color: 'var(--color-primary)' }}>View Proof</a>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* POD Modal */}
      {activeStop && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="modal-content card" style={{ padding: '24px', width: '100%', maxWidth: '400px', backgroundColor: '#fff', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Complete Delivery</h3>
              <button onClick={() => { setActiveStop(null); setPodFile(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <p style={{ margin: '0 0 16px 0', fontSize: '0.9em', color: '#666' }}>
              <strong>Tracking:</strong> {activeStop.tracking_number} <br />
              <strong>To:</strong> {activeStop.recipient_name}
            </p>

            <form onSubmit={handleCompleteDelivery}>
              <div style={{
                border: '2px dashed #ddd', borderRadius: '8px', padding: '24px', 
                textAlign: 'center', marginBottom: '16px', cursor: 'pointer',
                backgroundColor: podFile ? '#f0fdf4' : '#fafafa'
              }} onClick={() => fileInputRef.current?.click()}>
                
                {podFile ? (
                  <div>
                    <Upload size={32} color="#16a34a" style={{ margin: '0 auto 8px auto' }} />
                    <p style={{ margin: 0, color: '#16a34a', fontWeight: '500' }}>Photo attached!</p>
                    <small style={{ color: '#666' }}>{podFile.name}</small>
                  </div>
                ) : (
                  <div>
                    <Camera size={32} color="#888" style={{ margin: '0 auto 8px auto' }} />
                    <p style={{ margin: 0, color: '#666', fontWeight: '500' }}>Tap to take photo</p>
                    <small style={{ color: '#888' }}>Upload proof of delivery</small>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={(e) => setPodFile(e.target.files[0])}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setActiveStop(null); setPodFile(null); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSubmitting || !podFile}>
                  {isSubmitting ? "Uploading..." : "Confirm Delivery"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toast message={toast.message} tone={toast.tone} onClose={toast.close} />
    </>
  );
}
