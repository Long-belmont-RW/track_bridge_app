import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldAlert,
  RefreshCw,
  Fingerprint,
  ScanLine,
  Radio,
  BadgeCheck,
  Building2,
  Truck,
  User,
  Check,
} from "lucide-react";
import Reveal from "../../components/Reveal";
import RotatingWords from "../../components/RotatingWords";

export default function Landing() {
  return (
    <>
      <section className="hero">
        <span className="eyebrow">Proof-of-delivery infrastructure</span>
        <h1>
          Every delivery, <RotatingWords words={["signed", "sealed", "verified"]} />.
        </h1>
        <p className="hero-sub">
          The logistics proof-of-work protocol for high-trust environments. Generate a tracking
          number with one API call at checkout, then eliminate disputes with real-time secured
          signatures and photographic evidence.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="btn btn-accent btn-lg">
            Get started <ArrowRight size={17} />
          </Link>
          <Link to="/how-it-works" className="btn btn-outline btn-lg">
            See how it works
          </Link>
        </div>
      </section>

      <section className="strip">
        <Reveal direction="up" delay={0}>
          <div className="strip-item">
            <span className="strip-icon">
              <ShieldAlert size={20} strokeWidth={2} />
            </span>
            <h3>Delivery disputes</h3>
            <p>End "never received" claims with undeniable multi-factor proof of drop-off.</p>
          </div>
        </Reveal>
        <Reveal direction="up" delay={90}>
          <div className="strip-item">
            <span className="strip-icon">
              <RefreshCw size={20} strokeWidth={2} />
            </span>
            <h3>Manual processes</h3>
            <p>
              Replace paper logs with one API call — generate a tracking number at checkout and let
              TrackBridge take it from there.
            </p>
          </div>
        </Reveal>
        <Reveal direction="up" delay={180}>
          <div className="strip-item">
            <span className="strip-icon">
              <Fingerprint size={20} strokeWidth={2} />
            </span>
            <h3>Fraud reduction</h3>
            <p>Real-time secured timestamps and GPS tagging make records tamper-proof.</p>
          </div>
        </Reveal>
      </section>

      <section className="section">
        <Reveal direction="up" as="div" className="section-head">
          <h2>Three steps between pickup and proof</h2>
          <p className="section-sub">
            TrackBridge's unified protocol connects every stakeholder in the delivery lifecycle
            through a single source of truth.
          </p>
        </Reveal>
        <div className="steps">
          <Reveal direction="up" delay={0}>
            <div className="step">
              <span className="step-num">01</span>
              <span className="step-icon">
                <ScanLine size={22} strokeWidth={1.8} />
              </span>
              <h4>Capture</h4>
              <p>Drivers scan, photo, and sign at the point of fulfilment. Instantly digitized.</p>
            </div>
          </Reveal>
          <Reveal direction="up" delay={110}>
            <div className="step">
              <span className="step-num">02</span>
              <span className="step-icon">
                <Radio size={22} strokeWidth={1.8} />
              </span>
              <h4>Sync</h4>
              <p>Data is encrypted and broadcast to the dashboard for real-time operations tracking.</p>
            </div>
          </Reveal>
          <Reveal direction="up" delay={220}>
            <div className="step">
              <span className="step-num">03</span>
              <span className="step-icon">
                <BadgeCheck size={22} strokeWidth={1.8} />
              </span>
              <h4>Verify</h4>
              <p>Immutable proof of delivery is generated and shared with customers automatically.</p>
            </div>
          </Reveal>
        </div>
        <Reveal direction="up" as="div" style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link to="/how-it-works" className="link-btn" style={{ display: "inline-flex", alignItems: "center", gap: "0.4em" }}>
            See the full breakdown <ArrowRight size={14} />
          </Link>
        </Reveal>
      </section>

      <section className="section" id="who-its-for">
        <Reveal direction="up" as="div" className="section-head">
          <h2>Built for e-commerce businesses</h2>
          <p className="section-sub">
            One protocol, three connected experiences — for the business, the driver on the road,
            and the customer waiting at the door.
          </p>
        </Reveal>
        <div className="who-grid">
          <Reveal direction="up" delay={0}>
            <div className="who-card">
              <span className="who-icon">
                <Building2 size={20} strokeWidth={1.8} />
              </span>
              <h4>Operations &amp; Business</h4>
              <ul>
                <li>
                  <Check size={15} /> Centralized command center for all deliveries.
                </li>
                <li>
                  <Check size={15} /> Automated invoicing upon delivery verification.
                </li>
              </ul>
            </div>
          </Reveal>
          <Reveal direction="up" delay={110}>
            <div className="who-card">
              <span className="who-icon">
                <Truck size={20} strokeWidth={1.8} />
              </span>
              <h4>Field Drivers</h4>
              <ul>
                <li>
                  <Check size={15} /> Offline-first mobile app for remote deliveries.
                </li>
                <li>
                  <Check size={15} /> Instant signature and photo capture workflow.
                </li>
              </ul>
            </div>
          </Reveal>
          <Reveal direction="up" delay={220}>
            <div className="who-card">
              <span className="who-icon">
                <User size={20} strokeWidth={1.8} />
              </span>
              <h4>Final Customers</h4>
              <ul>
                <li>
                  <Check size={15} /> SMS/Email live tracking links. No app required.
                </li>
                <li>
                  <Check size={15} /> Digital receipts for every verified drop-off.
                </li>
              </ul>
            </div>
          </Reveal>
        </div>
        <Reveal direction="up" as="div" style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link to="/who-its-for" className="link-btn" style={{ display: "inline-flex", alignItems: "center", gap: "0.4em" }}>
            Explore each role in detail <ArrowRight size={14} />
          </Link>
        </Reveal>
      </section>

      <Reveal direction="scale" as="section" className="pricing">
        <div>
          <h2>One flat plan. Free for your first 30 days.</h2>
          <p>
            No tiers to compare, no per-delivery surprises — just TrackBridge Pro, in Naira, once
            your company's trial ends. Driver and customer accounts are always free.
          </p>
        </div>
        <div className="pricing-cta">
          <Link to="/register" className="btn btn-accent btn-lg">
            Start free trial
          </Link>
          <span className="pricing-cta-note">For companies — sign up as a driver or customer any time, free.</span>
        </div>
      </Reveal>
    </>
  );
}
