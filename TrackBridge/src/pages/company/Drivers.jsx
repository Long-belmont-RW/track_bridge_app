import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { listDrivers, registerDriver } from "../../data/api";
import { PageHeader, Card, EmptyState, Toast } from "../../components/Ui";
import { Users } from "lucide-react";
import Modal from "../../components/Modal";
import useToast from "../../components/useToast";

export default function Drivers() {
  const { user } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [vehicle, setVehicle] = useState("Cargo Van");
  const toast = useToast();

  async function refresh() {
    setDrivers(await listDrivers({ companyId: user.id }));
  }

  useEffect(() => {
    refresh();
  }, [user.id]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    await registerDriver({ companyId: user.id, name, vehicle });
    setName("");
    setShowModal(false);
    toast.show("Driver added.");
    refresh();
  }

  return (
    <>
      <PageHeader
        title="Drivers"
        subtitle="Everyone out on the road for you."
        action={
          <button className="btn btn-dark" onClick={() => setShowModal(true)}>
            + Add driver
          </button>
        }
      />
      <Card>
        {drivers.length === 0 ? (
          <EmptyState icon={Users} title="No drivers yet" subtitle="Available drivers appear here." />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Vehicle</th>
                <th>Availability</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d.id}>
                  <td>{d.name}</td>
                  <td>{d.vehicle}</td>
                  <td>
                    <span className={`pill pill-${d.available ? "delivered" : "unassigned"}`}>
                      {d.available ? "Available" : "Offline"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {showModal && (
        <Modal title="Add driver" onClose={() => setShowModal(false)} width={420}>
          <form className="settings-form" onSubmit={handleAdd}>
            <label className="field">
              <span>Full name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sam Rivera" />
            </label>
            <label className="field">
              <span>Vehicle type</span>
              <select value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
                <option>Cargo Van</option>
                <option>Motorcycle</option>
                <option>Sedan</option>
                <option>Pickup Truck</option>
              </select>
            </label>
            <button className="btn btn-dark btn-block" type="submit">
              Add Driver
            </button>
          </form>
        </Modal>
      )}

      <Toast message={toast.message} tone={toast.tone} onClose={toast.close} />
    </>
  );
}
