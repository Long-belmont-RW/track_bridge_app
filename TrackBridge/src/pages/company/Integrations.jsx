import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getApiKey, rollApiKey, generateTrackingNumber, listApiActivity } from "../../data/api";
import { PageHeader, Card, EmptyState, Toast } from "../../components/Ui";
import useToast from "../../components/useToast";
import { getBillingState } from "../../utils/billing";
import { formatNaira } from "../../utils/currency";
import { Code2, Copy, Eye, EyeOff, KeyRound, Lock, RefreshCw, Webhook, Send } from "lucide-react";

const LANGS = ["cURL", "Node.js", "Python"];

function buildSnippet(lang, apiKey) {
  const body = `{
  "orderRef": "ORD-48213",
  "recipientName": "Amaka Obi",
  "recipientEmail": "amaka@example.com",
  "address": "14 Admiralty Way, Lekki Phase 1, Lagos",
  "item": "Wireless earbuds",
  "fee": 2050
}`;
  if (lang === "cURL") {
    return `curl -X POST https://api.trackbridge.io/v1/tracking \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '${body.replace(/\n\s*/g, " ")}'`;
  }
  if (lang === "Node.js") {
    return `const res = await fetch("https://api.trackbridge.io/v1/tracking", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ${apiKey}",
    "Content-Type": "application/json",
  },
  body: JSON.stringify(${body}),
});
const { trackingNumber, trackingUrl } = await res.json();
// Email trackingNumber to the customer, or redirect to trackingUrl.`;
  }
  return `import requests

res = requests.post(
    "https://api.trackbridge.io/v1/tracking",
    headers={"Authorization": "Bearer ${apiKey}"},
    json=${body},
)
tracking_number = res.json()["trackingNumber"]
# Email tracking_number to the customer, or redirect to trackingUrl.`;
}

export default function CompanyIntegrations() {
  const { user } = useAuth();
  const { isGated } = getBillingState(user);
  const [apiKey, setApiKey] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [lang, setLang] = useState("cURL");
  const [activity, setActivity] = useState([]);
  const [result, setResult] = useState(null);
  const [generating, setGenerating] = useState(false);
  const toast = useToast();

  async function refreshActivity() {
    const rows = await listApiActivity({ companyId: user.id });
    setActivity(rows);
  }

  useEffect(() => {
    getApiKey(user.id).then(setApiKey);
    refreshActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  function maskedKey() {
    if (!apiKey) return "";
    if (revealed) return apiKey;
    return apiKey.slice(0, 8) + "•".repeat(18) + apiKey.slice(-4);
  }

  async function copy(text, label) {
    try {
      await navigator.clipboard.writeText(text);
      toast.show(`${label} copied.`);
    } catch {
      toast.show("Couldn't copy — select and copy manually.", "danger");
    }
  }

  async function handleRoll() {
    const next = await rollApiKey(user.id);
    setApiKey(next);
    setRevealed(true);
    toast.show("New secret key generated. Update it in your checkout backend.");
  }

  async function handleGenerate(payload) {
    setGenerating(true);
    const res = await generateTrackingNumber({ ...payload, companyId: user.id });
    setResult(res);
    setGenerating(false);
    toast.show(`Tracking number ${res.trackingNumber} generated and "emailed".`);
    refreshActivity();
  }

  return (
    <>
      <PageHeader
        title="API & Integrations"
        subtitle="Generate tracking numbers directly from your checkout flow — customers never need to leave your site until it's time to track."
      />

      <Card className="integration-flow-card">
        <h3 style={{ marginTop: 0 }}>How it fits into your checkout</h3>
        <ol className="integration-flow-steps">
          <li>Customer completes checkout on your site as usual.</li>
          <li>
            Your backend calls <code>POST /v1/tracking</code> with the order details, using your
            secret key below.
          </li>
          <li>TrackBridge returns a tracking number and emails it to the customer automatically.</li>
          <li>
            The customer pastes that number into the <strong>Track</strong> page (on TrackBridge, or
            embedded on your own site) to follow the delivery — no TrackBridge account required.
          </li>
        </ol>
      </Card>

      <Card>
        <div className="integration-key-row">
          <div>
            <h3 style={{ margin: "0 0 0.2em" }}>
              <KeyRound size={16} style={{ verticalAlign: "-2px", marginRight: "0.4em" }} />
              Secret key
            </h3>
            <p className="muted" style={{ margin: 0 }}>
              Send this as a bearer token from your server. Never expose it in client-side code.
            </p>
          </div>
        </div>
        <div className="code-key-display">
          <code>{maskedKey()}</code>
          <div className="code-key-actions">
            <button
              type="button"
              className="icon-btn"
              onClick={() => setRevealed((v) => !v)}
              aria-label={revealed ? "Hide key" : "Reveal key"}
              title={revealed ? "Hide" : "Reveal"}
            >
              {revealed ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => copy(apiKey, "Secret key")}
              aria-label="Copy key"
              title="Copy"
            >
              <Copy size={15} />
            </button>
          </div>
        </div>
        <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: "0.9rem" }} onClick={handleRoll}>
          <RefreshCw size={14} /> Regenerate key
        </button>
      </Card>

      <Card>
        <h3 style={{ marginTop: 0, display: "flex", alignItems: "center", gap: "0.5em" }}>
          <Code2 size={16} /> Quick integration
        </h3>
        <div className="code-lang-tabs">
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              className={"chip" + (lang === l ? " active" : "")}
              onClick={() => setLang(l)}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="code-block-wrap">
          <button
            type="button"
            className="icon-btn code-block-copy"
            onClick={() => copy(buildSnippet(lang, apiKey || "sk_live_…"), "Snippet")}
            aria-label="Copy snippet"
            title="Copy"
          >
            <Copy size={14} />
          </button>
          <pre className="code-block">
            <code>{buildSnippet(lang, apiKey || "sk_live_…")}</code>
          </pre>
        </div>
        <p className="muted" style={{ fontSize: "0.85rem" }}>
          Response: <code>{`{ trackingNumber, trackingUrl, status, emailed }`}</code>
        </p>
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>Try it — simulate an order</h3>
        <p className="muted" style={{ marginTop: "-0.4em" }}>
          This mimics what happens when your backend calls the endpoint above. Since this preview
          has no live backend, the request stays on your device and nothing is really emailed.
        </p>
        {isGated ? (
          <div className="notice notice-warning">
            <Lock size={14} />
            Your free trial has ended, so the API is paused.{" "}
            <Link to="/company/billing">Subscribe to TrackBridge Pro</Link> to keep generating
            tracking numbers.
          </div>
        ) : (
          <>
            <TryItForm onSubmit={handleGenerate} loading={generating} />
            {result && (
              <div className="integration-result">
                <div>
                  <span className="field-label">Tracking number</span>
                  <div className="integration-result-value">{result.trackingNumber}</div>
                </div>
                <div>
                  <span className="field-label">Tracking URL</span>
                  <div className="integration-result-value integration-result-url">{result.trackingUrl}</div>
                </div>
                <div className="integration-result-note">
                  <Send size={14} /> "Emailed" to customer (simulated) — try pasting the tracking
                  number into the public Track page.
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <Card>
        <h3 style={{ marginTop: 0, display: "flex", alignItems: "center", gap: "0.5em" }}>
          <Webhook size={16} /> Webhook notifications
        </h3>
        <p className="muted" style={{ marginTop: "-0.4em" }}>
          Get a POST request every time a tracked order changes status. Not yet wired up in this
          preview — saving here is just for illustration.
        </p>
        <WebhookForm onSaved={() => toast.show("Webhook URL saved (simulated).")} />
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>Recent API activity</h3>
        {activity.length === 0 ? (
          <EmptyState
            icon={Code2}
            title="No API calls yet"
            subtitle="Generate a tracking number above to see it logged here, just like a request log."
          />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Order ref</th>
                <th>Tracking #</th>
                <th>Sent to</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {activity.map((row) => (
                <tr key={row.id}>
                  <td>{row.orderRef}</td>
                  <td>{row.trackingNumber}</td>
                  <td>{row.recipientEmail}</td>
                  <td>{new Date(row.at).toLocaleTimeString()}</td>
                  <td>
                    <span className="pill pill-delivered">success</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Toast message={toast.message} tone={toast.tone} onClose={toast.close} />
    </>
  );
}

function TryItForm({ onSubmit, loading }) {
  const [orderRef, setOrderRef] = useState("ORD-" + Math.floor(10000 + Math.random() * 89999));
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [address, setAddress] = useState("");
  const [item, setItem] = useState("");
  const [fee, setFee] = useState("2050");

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ orderRef, recipientName, recipientEmail, address, item, fee });
  }

  return (
    <form className="settings-form" onSubmit={handleSubmit}>
      <div className="field-row">
        <label className="field">
          <span>Order reference</span>
          <input value={orderRef} onChange={(e) => setOrderRef(e.target.value)} />
        </label>
        <label className="field">
          <span>Delivery fee (₦)</span>
          <input type="number" min="0" value={fee} onChange={(e) => setFee(e.target.value)} />
        </label>
      </div>
      <div className="field-row">
        <label className="field">
          <span>Customer name</span>
          <input
            placeholder="e.g. Amaka Obi"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Customer email</span>
          <input
            type="email"
            placeholder="customer@example.com"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            required
          />
        </label>
      </div>
      <label className="field">
        <span>Delivery address</span>
        <input placeholder="Where it's going" value={address} onChange={(e) => setAddress(e.target.value)} required />
      </label>
      <label className="field">
        <span>Item</span>
        <input placeholder="What's in the order" value={item} onChange={(e) => setItem(e.target.value)} required />
      </label>
      <button className="btn btn-dark btn-block" type="submit" disabled={loading}>
        {loading ? "Calling API…" : "Generate tracking number"}
      </button>
    </form>
  );
}

function WebhookForm({ onSaved }) {
  const [url, setUrl] = useState("");
  function handleSubmit(e) {
    e.preventDefault();
    onSaved();
  }
  return (
    <form className="webhook-form" onSubmit={handleSubmit}>
      <input
        type="url"
        placeholder="https://yourshop.com/webhooks/trackbridge"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button className="btn btn-outline" type="submit">
        Save
      </button>
    </form>
  );
}
