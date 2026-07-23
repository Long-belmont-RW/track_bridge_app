import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Card, Toast } from "../../components/Ui";
import useToast from "../../components/useToast";

export default function DriverSettings() {
  const { user } = useAuth();
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [vehicle, setVehicle] = useState("Cargo Van");
  const [plate, setPlate] = useState(user.plateNumber || "");
  const [available, setAvailable] = useState(false);
  const toast = useToast();

  function saveProfile(e) {
    e.preventDefault();
    toast.show("Profile updated.");
  }

  function updatePassword(e) {
    e.preventDefault();
    toast.show("Password updated.");
  }

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your profile and account." />

      <Card>
        <div className="settings-identity">
          <span className="avatar avatar-lg">{name.slice(0, 2).toUpperCase() || "YN"}</span>
          <div>
            <strong>{name || "Your Name"}</strong>
            <div className="muted">Driver Account</div>
          </div>
        </div>

        <h3>Edit profile</h3>
        <p className="muted">Update your account details.</p>
        <form className="settings-form" onSubmit={saveProfile}>
          <div className="field-row">
            <label className="field">
              <span>Full name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="field">
              <span>Email</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
          </div>
          <div className="field-row">
            <label className="field">
              <span>Phone</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" />
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
          </div>
          <label className="field">
            <span>Plate number</span>
            <input value={plate} onChange={(e) => setPlate(e.target.value)} />
          </label>
          <button className="btn btn-dark" type="submit">
            Save changes
          </button>
        </form>
      </Card>

      <Card>
        <h3>Availability</h3>
        <p className="muted">Toggle whether you show up as available for new deliveries.</p>
        <button
          className={"btn " + (available ? "btn-online" : "btn-outline")}
          onClick={() => setAvailable((a) => !a)}
        >
          <span className={"status-dot" + (available ? " on" : "")} /> {available ? "Available" : "Offline — go available"}
        </button>
      </Card>

      <Card>
        <h3>Change password</h3>
        <p className="muted">Choose a new password for your account.</p>
        <form className="settings-form" onSubmit={updatePassword}>
          <label className="field">
            <span>Current password</span>
            <input type="password" placeholder="••••••••" />
          </label>
          <div className="field-row">
            <label className="field">
              <span>New password</span>
              <input type="password" placeholder="••••••••" />
            </label>
            <label className="field">
              <span>Confirm new password</span>
              <input type="password" placeholder="••••••••" />
            </label>
          </div>
          <button className="btn btn-outline" type="submit">
            Update password
          </button>
        </form>
      </Card>

      <Toast message={toast.message} tone={toast.tone} onClose={toast.close} />
    </>
  );
}
