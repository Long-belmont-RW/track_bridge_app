import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Card, EmptyState, Toast } from "../../components/Ui";
import Modal from "../../components/Modal";
import useToast from "../../components/useToast";
import { getBillingState, formatTrialEnd } from "../../utils/billing";
import { formatNaira } from "../../utils/currency";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  CreditCard,
  Receipt,
  FastForward,
} from "lucide-react";

const PLAN_PRICE = 45000;
const PLAN_FEATURES = [
  "Unlimited tracking numbers generated via the API",
  "Unlimited drivers and deliveries",
  "Dispute queue with proof-of-delivery evidence",
  "Webhook notifications on status changes",
  "Priority support",
];

export default function CompanyBilling() {
  const { user, updateBilling } = useAuth();
  const { status, daysLeft, isGated } = getBillingState(user);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const toast = useToast();

  function handleSubscribed() {
    const now = Date.now();
    const invoice = {
      id: `inv-${now}`,
      date: now,
      amount: PLAN_PRICE,
      status: "Paid",
    };
    updateBilling({
      planStatus: "active",
      plan: "Pro",
      paymentMethod: { brand: "Visa", last4: "4242" },
      subscribedAt: now,
      invoices: [invoice, ...(user.invoices || [])],
    });
    setPaymentOpen(false);
    toast.show("Subscribed to TrackBridge Pro (simulated). Full access restored.");
  }

  function handleCancel() {
    updateBilling({ planStatus: "expired", plan: null, paymentMethod: null });
    setCancelOpen(false);
    toast.show("Subscription canceled (simulated).", "warning");
  }

  // Demo-only convenience: jump straight to an expired trial so the
  // gated-access behavior is easy to show without waiting 30 days.
  function simulateTrialEnded() {
    updateBilling({ planStatus: "expired", trialEndsAt: Date.now() - 1000 });
    toast.show("Trial fast-forwarded to expired (simulated).", "warning");
  }

  return (
    <>
      <PageHeader title="Billing & Plan" subtitle="One plan, no tiers — manage your subscription here." />

      <StatusCard status={status} daysLeft={daysLeft} user={user} onSubscribeClick={() => setPaymentOpen(true)} />

      <Card>
        <div className="plan-card-head">
          <div>
            <h3 style={{ margin: "0 0 0.2em" }}>TrackBridge Pro</h3>
            <p className="muted" style={{ margin: 0 }}>The only plan — everything, no add-ons to chase.</p>
          </div>
          <div className="plan-price">
            {formatNaira(PLAN_PRICE)}
            <span>/month</span>
          </div>
        </div>
        <ul className="plan-feature-list">
          {PLAN_FEATURES.map((f) => (
            <li key={f}>
              <CheckCircle2 size={15} /> {f}
            </li>
          ))}
        </ul>
        {status === "active" ? (
          <div className="plan-actions">
            <button className="btn btn-outline btn-sm" onClick={() => setPaymentOpen(true)}>
              <CreditCard size={14} /> Update payment method
            </button>
            <button className="btn btn-outline btn-sm btn-danger-outline" onClick={() => setCancelOpen(true)}>
              Cancel subscription
            </button>
          </div>
        ) : (
          <button className="btn btn-dark" onClick={() => setPaymentOpen(true)}>
            Subscribe to TrackBridge Pro
          </button>
        )}
      </Card>

      <Card>
        <h3 style={{ marginTop: 0, display: "flex", alignItems: "center", gap: "0.5em" }}>
          <Receipt size={16} /> Invoices
        </h3>
        {(user.invoices || []).length === 0 ? (
          <EmptyState icon={Receipt} title="No invoices yet" subtitle="Your first invoice will appear here once you subscribe." />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {user.invoices.map((inv) => (
                <tr key={inv.id}>
                  <td>{new Date(inv.date).toLocaleDateString()}</td>
                  <td>{formatNaira(inv.amount)}</td>
                  <td>
                    <span className="pill pill-delivered">{inv.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {status !== "active" && (
        <Card className="demo-controls-card">
          <h3 style={{ marginTop: 0, display: "flex", alignItems: "center", gap: "0.5em" }}>
            <FastForward size={15} /> Preview trial expiry
          </h3>
          <p className="muted" style={{ marginTop: "-0.3em" }}>
            This preview has no live backend to wait 30 real days, so use this to see what a
            company sees once its trial actually runs out.
          </p>
          <button className="btn btn-outline btn-sm" onClick={simulateTrialEnded}>
            Simulate: end trial now
          </button>
        </Card>
      )}

      {paymentOpen && (
        <PaymentModal onClose={() => setPaymentOpen(false)} onSubmit={handleSubscribed} />
      )}
      {cancelOpen && (
        <Modal title="Cancel subscription?" onClose={() => setCancelOpen(false)} width={420}>
          <p style={{ marginTop: 0 }}>
            You'll lose access to the API, dispute queue, and driver management until you
            subscribe again.
          </p>
          <div className="step-actions">
            <button className="btn btn-outline" onClick={() => setCancelOpen(false)}>
              Keep my plan
            </button>
            <button className="btn btn-dark btn-danger" onClick={handleCancel}>
              Cancel subscription
            </button>
          </div>
        </Modal>
      )}

      <Toast message={toast.message} tone={toast.tone} onClose={toast.close} />
    </>
  );
}

function StatusCard({ status, daysLeft, user, onSubscribeClick }) {
  if (status === "active") {
    return (
      <Card className="billing-status billing-status-active">
        <CheckCircle2 size={20} />
        <div>
          <strong>You're on TrackBridge Pro</strong>
          <p className="muted" style={{ margin: "0.2em 0 0" }}>
            Card on file: {user.paymentMethod?.brand} •••• {user.paymentMethod?.last4}
          </p>
        </div>
      </Card>
    );
  }

  if (status === "expired") {
    return (
      <Card className="billing-status billing-status-expired">
        <AlertTriangle size={20} />
        <div>
          <strong>Your free trial has ended</strong>
          <p className="muted" style={{ margin: "0.2em 0 0" }}>
            Subscribe to restore access to the API, deliveries, and dispute tools.
          </p>
        </div>
        <button className="btn btn-dark btn-sm" onClick={onSubscribeClick}>
          Subscribe now
        </button>
      </Card>
    );
  }

  return (
    <Card className="billing-status billing-status-trial">
      <Clock size={20} />
      <div>
        <strong>{daysLeft === 1 ? "1 day left" : `${daysLeft} days left`} in your free trial</strong>
        <p className="muted" style={{ margin: "0.2em 0 0" }}>
          Trial ends {formatTrialEnd(user.trialEndsAt)}. Add a payment method any time to keep
          access without interruption.
        </p>
      </div>
      <button className="btn btn-outline btn-sm" onClick={onSubscribeClick}>
        Add payment method
      </button>
    </Card>
  );
}

function PaymentModal({ onClose, onSubmit }) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <Modal title="Add payment method" onClose={onClose} width={440}>
      <p className="muted" style={{ marginTop: 0 }}>
        This preview has no live payment processor — submitting just marks your account as
        subscribed.
      </p>
      <form className="settings-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Cardholder name</span>
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Name on card" />
        </label>
        <label className="field">
          <span>Card number</span>
          <input
            required
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="4242 4242 4242 4242"
            inputMode="numeric"
          />
        </label>
        <div className="field-row">
          <label className="field">
            <span>Expiry</span>
            <input required value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" />
          </label>
          <label className="field">
            <span>CVV</span>
            <input required value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="123" inputMode="numeric" />
          </label>
        </div>
        <button className="btn btn-dark btn-block" type="submit">
          Subscribe — {formatNaira(PLAN_PRICE)}/month
        </button>
      </form>
    </Modal>
  );
}
