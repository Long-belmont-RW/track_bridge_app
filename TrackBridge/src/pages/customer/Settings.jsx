import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Card } from "../../components/Ui";
import useToast from "../../components/useToast";
import { Toast } from "../../components/Ui";

export default function CustomerSettings() {
  const { user, signOut } = useAuth();
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [address, setAddress] = useState(user.deliveryAddress || "");
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [smsUpdates, setSmsUpdates] = useState(true);
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
            <div className="muted">Customer Account</div>
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
              <input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            <label className="field">
              <span>Delivery address</span>
              <input value={address} onChange={(e) => setAddress(e.target.value)} />
            </label>
          </div>
          <button className="btn btn-dark" type="submit">
            Save changes
          </button>
        </form>
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

      <Card>
        <h3>Notifications</h3>
        <p className="muted">Choose how you'd like to hear about delivery updates.</p>
        <label className="checkbox-row">
          <input type="checkbox" checked={emailUpdates} onChange={(e) => setEmailUpdates(e.target.checked)} />
          Email me on every status change
        </label>
        <label className="checkbox-row">
          <input type="checkbox" checked={smsUpdates} onChange={(e) => setSmsUpdates(e.target.checked)} />
          Text me when my delivery is out for delivery
        </label>
      </Card>

      <Card>
        <h3 className="danger-heading">Log out</h3>
        <p className="muted">Sign out of your TrackBridge account on this device.</p>
        <button className="btn btn-danger-outline" onClick={signOut}>
          Log out
        </button>
      </Card>

      <Toast message={toast.message} tone={toast.tone} onClose={toast.close} />
    </>
  );
}
