import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createDelivery, listDeliveries, listDrivers } from "../../data/api";
import { PageHeader, Card, EmptyState, Toast } from "../../components/Ui";
import { PackageSearch, Lock } from "lucide-react";
import Modal from "../../components/Modal";
import useToast from "../../components/useToast";
import { formatNaira } from "../../utils/currency";
import { getBillingState } from "../../utils/billing";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "unassigned", label: "Unassigned" },
  { value: "assigned", label: "Assigned" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "disputed", label: "Disputed" },
];

export default function CompanyDeliveries() {
  const { user } = useAuth();
  const { isGated } = getBillingState(user);
  const [filter, setFilter] = useState("all");
  const [deliveries, setDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const toast = useToast();

  async function refresh() {
    const rows = await listDeliveries({ companyId: user.id, status: filter });
    setDeliveries(rows);
  }

  useEffect(() => {
    refresh();
    listDrivers({ companyId: user.id }).then(setDrivers);
  }, [user.id, filter]);

  async function handleCreate(payload) {
    await createDelivery({ ...payload, companyId: user.id });
    setShowModal(false);
    toast.show("Delivery created.");
    refresh();
  }

  return (
    <>
      <PageHeader
        title="Deliveries"
        subtitle="Every shipment, tracked end to end."
        action={
          <button
            className="btn btn-dark"
            onClick={() => setShowModal(true)}
            disabled={isGated}
            title={isGated ? "Subscribe to create new deliveries" : undefined}
          >
            {isGated && <Lock size={13} />} + New delivery
          </button>
        }
      />

      {isGated && (
        <div className="notice notice-warning">
          <Lock size={14} />
          Your free trial has ended, so new deliveries are paused.{" "}
          <Link to="/company/billing">Subscribe to TrackBridge Pro</Link> to keep going.
        </div>
      )}

      <div className="filter-row">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={"chip" + (filter === f.value ? " active" : "")}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card>
        {deliveries.length === 0 ? (
          <EmptyState icon={PackageSearch} title="No deliveries yet" subtitle="They'll show up here once created." />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Tracking #</th>
                <th>Recipient</th>
                <th>Address</th>
                <th>Driver</th>
                <th>Fee</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((d) => (
                <tr key={d.id}>
                  <td>{d.trackingNumber}</td>
                  <td>{d.recipientName}</td>
                  <td>{d.address}</td>
                  <td>{d.driverName || "Unassigned"}</td>
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

      {showModal && (
        <Modal title="New Delivery" onClose={() => setShowModal(false)}>
          <NewDeliveryForm drivers={drivers} onSubmit={handleCreate} />
        </Modal>
      )}

      <Toast message={toast.message} tone={toast.tone} onClose={toast.close} />
    </>
  );
}

function NewDeliveryForm({ drivers, onSubmit }) {
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [address, setAddress] = useState("");
  const [item, setItem] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [driverId, setDriverId] = useState("");
  const [fee, setFee] = useState("2050");

  function handleSubmit(e) {
    e.preventDefault();
    const driver = drivers.find((d) => d.id === driverId);
    onSubmit({
      recipientName,
      recipientPhone,
      address,
      item,
      deliveryDate,
      deliveryTime,
      driverId: driverId || null,
      driverName: driver?.name || null,
      fee: Number(fee) || 0,
    });
  }

  return (
    <form className="settings-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Recipient name</span>
        <input placeholder="e.g. John Doe" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
      </label>
      <label className="field">
        <span>Recipient phone</span>
        <input placeholder="+234 …" value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} />
      </label>
      <label className="field">
        <span>Delivery address</span>
        <input placeholder="Search address or landmark…" value={address} onChange={(e) => setAddress(e.target.value)} />
      </label>
      <label className="field">
        <span>Package / item description</span>
        <input placeholder="What are you delivering?" value={item} onChange={(e) => setItem(e.target.value)} />
      </label>
      <div className="field-row">
        <label className="field">
          <span>Delivery date</span>
          <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
        </label>
        <label className="field">
          <span>Delivery time</span>
          <input type="time" value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} />
        </label>
      </div>
      <label className="field">
        <span>Delivery fee (₦)</span>
        <input type="number" min="0" value={fee} onChange={(e) => setFee(e.target.value)} />
      </label>
      <label className="field">
        <span>Assign a driver</span>
        <select value={driverId} onChange={(e) => setDriverId(e.target.value)}>
          <option value="">Select a driver (optional)</option>
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </label>
      <button className="btn btn-dark btn-block" type="submit">
        Create Delivery
      </button>
    </form>
  );
}
