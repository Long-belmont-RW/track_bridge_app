import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Card, Toast } from "../../components/Ui";
import useToast from "../../components/useToast";
import { Lock } from "lucide-react";

export default function CompanySettings() {
  const { user } = useAuth();

  const companyName = user.name || "Your Company";
  const email = user.email || "";
  const [phone, setPhone] = useState(user.phone || "");
  const [industry, setIndustry] = useState("E-commerce");
  const [address, setAddress] = useState(user.businessAddress || "");
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
          <span className="avatar avatar-lg">{companyName.slice(0, 2).toUpperCase() || "YC"}</span>
          <div>
            <strong>{companyName}</strong>
            <div className="muted">Company Account</div>
          </div>
        </div>

        <h3>Edit profile</h3>
        <p className="muted">Update your account details.</p>
        <form className="settings-form" onSubmit={saveProfile}>
          <div className="field-row">
            <label className="field">
              <span>
                Company name <em aria-hidden="true">Locked</em>
              </span>
              <input value={companyName} disabled readOnly />
              <small className="field-hint">
                <Lock size={11} style={{ verticalAlign: "-1px", marginRight: "0.3em" }} />
                Contact support to change your registered company name.
              </small>
            </label>
            <label className="field">
              <span>
                Business email <em aria-hidden="true">Locked</em>
              </span>
              <input value={email} disabled readOnly />
              <small className="field-hint">
                <Lock size={11} style={{ verticalAlign: "-1px", marginRight: "0.3em" }} />
                Contact support to change your business email.
              </small>
            </label>
          </div>
          <div className="field-row">
            <label className="field">
              <span>Phone</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            <label className="field">
              <span>Industry</span>
              <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
                <option>E-commerce</option>
                <option>Retail</option>
                <option>Food & Beverage</option>
                <option>Manufacturing</option>
                <option>Other</option>
              </select>
            </label>
          </div>
          <label className="field">
            <span>Business address</span>
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter your full business address" />
          </label>
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

      <Toast message={toast.message} tone={toast.tone} onClose={toast.close} />
    </>
  );
}
