import { Link } from "react-router-dom";
import { ArrowRight, Code2, KeyRound, Mail, ScanLine, Copy } from "lucide-react";
import Reveal from "../../components/Reveal";

const SNIPPET = `curl -X POST https://api.trackbridge.io/v1/tracking \\
  -H "Authorization: Bearer sk_live_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "orderRef": "ORD-48213",
    "recipientName": "Amaka Obi",
    "recipientEmail": "amaka@example.com",
    "address": "14 Admiralty Way, Lekki Phase 1, Lagos",
    "item": "Wireless earbuds",
    "fee": 2050
  }'`;

const RESPONSE = `{
  "trackingNumber": "WB-38291",
  "trackingUrl": "https://trackbridge.io/track?id=WB-38291",
  "status": "unassigned",
  "emailed": true
}`;

export default function Developers() {
  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(SNIPPET);
    } catch {
      /* clipboard unavailable — safe to ignore in this preview */
    }
  }

  return (
    <>
      <section className="hero">
        <span className="eyebrow">For e-commerce &amp; logistics teams</span>
        <h1>
          Bring proof-of-delivery <span className="accent">into your own checkout</span>
        </h1>
        <p className="hero-sub">
          Call one endpoint after an order completes, and TrackBridge generates the tracking number,
          emails it to your customer, and handles verification from there — no widget, no
          redirect, no extra login for anyone.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="btn btn-accent btn-lg">
            Get an API key <ArrowRight size={17} />
          </Link>
          <Link to="/how-it-works" className="btn btn-outline btn-lg">
            How the protocol works
          </Link>
        </div>
      </section>

      <section className="strip">
        <Reveal direction="up" delay={0}>
          <div className="strip-item">
            <span className="strip-icon">
              <Code2 size={20} strokeWidth={2} />
            </span>
            <h3>One API call</h3>
            <p>Send order details right after checkout and get a tracking number back in one response.</p>
          </div>
        </Reveal>
        <Reveal direction="up" delay={90}>
          <div className="strip-item">
            <span className="strip-icon">
              <Mail size={20} strokeWidth={2} />
            </span>
            <h3>Auto-emailed to the customer</h3>
            <p>TrackBridge sends the tracking number straight to the buyer — nothing for your team to build.</p>
          </div>
        </Reveal>
        <Reveal direction="up" delay={180}>
          <div className="strip-item">
            <span className="strip-icon">
              <ScanLine size={20} strokeWidth={2} />
            </span>
            <h3>Trackable without an account</h3>
            <p>Customers paste the number into TrackBridge's Track page and follow the delivery — no login.</p>
          </div>
        </Reveal>
      </section>

      <section className="section">
        <Reveal direction="up" as="div" className="section-head">
          <h2>The integration, end to end</h2>
          <p className="section-sub">
            Everything below is illustrative — this preview has no live backend yet, so treat it as
            a working sketch of the real endpoint.
          </p>
        </Reveal>

        <div className="dev-flow">
          <Reveal direction="up" delay={0}>
            <div className="step">
              <span className="step-num">01</span>
              <h4>Customer checks out</h4>
              <p>Your storefront completes the order as usual, on your own domain.</p>
            </div>
          </Reveal>
          <Reveal direction="up" delay={100}>
            <div className="step">
              <span className="step-num">02</span>
              <h4>Your backend calls the API</h4>
              <p>
                <code>POST /v1/tracking</code> with the order and recipient details, authenticated
                with your secret key.
              </p>
            </div>
          </Reveal>
          <Reveal direction="up" delay={200}>
            <div className="step">
              <span className="step-num">03</span>
              <h4>TrackBridge replies with a tracking number</h4>
              <p>And emails it to the customer automatically — <code>emailed: true</code> in the response.</p>
            </div>
          </Reveal>
          <Reveal direction="up" delay={300}>
            <div className="step">
              <span className="step-num">04</span>
              <h4>Customer tracks, no account needed</h4>
              <p>They paste the number into the Track page and watch the delivery get verified.</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <Reveal direction="left" as="div">
          <div className="dev-code-panel">
            <div className="dev-code-col">
              <div className="dev-code-label">Request</div>
              <div className="code-block-wrap">
                <button type="button" className="icon-btn code-block-copy" onClick={copySnippet} aria-label="Copy request">
                  <Copy size={14} />
                </button>
                <pre className="code-block">
                  <code>{SNIPPET}</code>
                </pre>
              </div>
            </div>
            <div className="dev-code-col">
              <div className="dev-code-label">Response</div>
              <div className="code-block-wrap">
                <pre className="code-block">
                  <code>{RESPONSE}</code>
                </pre>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <Reveal direction="scale" as="section" className="pricing">
        <div>
          <h2>Your API key is waiting in the dashboard.</h2>
          <p>
            <KeyRound size={15} style={{ verticalAlign: "-2px", marginRight: "0.4em" }} />
            Create a company account to get a sandbox key and try the endpoint yourself.
          </p>
        </div>
        <Link to="/register" className="btn btn-accent btn-lg">
          Get started <ArrowRight size={17} />
        </Link>
      </Reveal>
    </>
  );
}
