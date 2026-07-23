import { Link } from "react-router-dom";
import {
  ArrowRight,
  ScanLine,
  Radio,
  BadgeCheck,
  ShoppingCart,
  PackageCheck,
  Truck,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import Reveal from "../../components/Reveal";

const PROTOCOL_STEPS = [
  {
    icon: ScanLine,
    title: "Capture",
    body:
      "At pickup, the driver scans the package QR code and confirms the pieces to be delivered. At drop-off, they capture a recipient signature, a timestamped photo of the delivered package, and a GPS stamp — all from the TrackBridge driver app, even offline.",
  },
  {
    icon: Radio,
    title: "Sync",
    body:
      "The moment a connection is available, that capture is encrypted and pushed to TrackBridge's servers. The company dashboard updates in real time — no end-of-day paperwork, no manual reconciliation.",
  },
  {
    icon: BadgeCheck,
    title: "Verify",
    body:
      "A tamper-proof proof-of-delivery record is generated from the signature, photo, and GPS stamp together. It's attached to the tracking number permanently, and shared automatically with the customer the moment it's ready.",
  },
];

const LIFECYCLE = [
  {
    icon: ShoppingCart,
    label: "Order placed",
    body:
      "Customer checks out on the company's own site. The company's backend calls the TrackBridge API right away, which generates a tracking number and emails it to the customer.",
  },
  { icon: PackageCheck, label: "Packed & assigned", body: "Company confirms the order and assigns it to an available driver." },
  { icon: Truck, label: "Picked up & in transit", body: "Driver scans the package and starts the route — live status updates from here on." },
  { icon: MapPin, label: "Out for delivery", body: "Customer pastes their tracking number on the Track page to see live status — no account needed." },
  { icon: CheckCircle2, label: "Delivered & verified", body: "Signature, photo, and GPS stamp are captured and the proof-of-delivery record is generated." },
];

export default function HowItWorks() {
  return (
    <>
      <div className="page-hero">
        <span className="eyebrow">The protocol</span>
        <h1>From pickup to proof, without the guesswork</h1>
        <p className="subtitle center">
          TrackBridge connects companies, drivers, and customers through one live record of every
          delivery — so nobody has to take anyone's word for what happened.
        </p>
      </div>

      <section className="section">
        <div className="steps">
          {PROTOCOL_STEPS.map((step, i) => (
            <Reveal direction="up" delay={i * 110} key={step.title}>
              <div className="step">
                <span className="step-num">0{i + 1}</span>
                <span className="step-icon">
                  <step.icon size={22} strokeWidth={1.8} />
                </span>
                <h4>{step.title}</h4>
                <p>{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section">
        <Reveal direction="up" as="div" className="section-head">
          <h2>The delivery lifecycle</h2>
          <p className="section-sub">
            Every order moves through the same five stages, visible to the customer, company, and
            driver at once.
          </p>
        </Reveal>
        <div className="timeline-vertical">
          {LIFECYCLE.map((item, i) => (
            <Reveal
              direction="left"
              delay={i * 80}
              key={item.label}
              className="timeline-vertical-item"
            >
              <span className="timeline-vertical-icon">
                <item.icon size={20} strokeWidth={1.8} />
              </span>
              <div>
                <h4 style={{ marginBottom: "0.25em" }}>{item.label}</h4>
                <p className="muted" style={{ margin: 0 }}>
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal direction="up" as="div" style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link
            to="/developers"
            className="link-btn"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4em" }}
          >
            See the API that powers step one <ArrowRight size={14} />
          </Link>
        </Reveal>
      </section>

      <Reveal direction="scale" as="section" className="pricing">
        <div>
          <h2>See it running on your own deliveries.</h2>
          <p>Set up your company account in minutes — no credit card required to start.</p>
        </div>
        <Link to="/register" className="btn btn-accent btn-lg">
          Get started <ArrowRight size={17} />
        </Link>
      </Reveal>
    </>
  );
}
