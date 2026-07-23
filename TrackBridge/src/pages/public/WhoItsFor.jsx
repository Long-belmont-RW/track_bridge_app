import { Link } from "react-router-dom";
import { ArrowRight, Building2, Truck, User, Check } from "lucide-react";
import Reveal from "../../components/Reveal";

const ROLES = [
  {
    icon: Building2,
    title: "Operations & Business",
    tagline: "Run every delivery from one dashboard.",
    points: [
      "Centralized command center for all deliveries, across every driver and warehouse.",
      "One API call at checkout generates a tracking number and emails it to the customer automatically.",
      "Automated invoicing the moment a delivery is verified — no manual billing.",
      "Assign drivers, track disputes, and monitor delivery success rate in real time.",
      "Naira-denominated invoicing and delivery fees, built in from day one.",
    ],
    cta: { label: "Create a company account", to: "/register" },
  },
  {
    icon: Truck,
    title: "Field Drivers",
    tagline: "Everything you need for the road, nothing you don't.",
    points: [
      "Offline-first mobile experience — capture proof even without signal, sync once connected.",
      "Instant signature and photo capture workflow at every drop-off.",
      "Go available or offline with one tap, and pick up open jobs near you.",
      "Track daily and monthly earnings without leaving the route screen.",
    ],
    cta: { label: "Sign up to drive", to: "/register" },
  },
  {
    icon: User,
    title: "Final Customers",
    tagline: "Know exactly where your order is, always.",
    points: [
      "SMS and email live tracking links — no app download required.",
      "A transparent dispute process if something looks wrong on arrival.",
      "Digital receipts and proof-of-delivery evidence for every verified drop-off.",
      "Rate your driver and the company directly from the tracking page.",
    ],
    cta: { label: "Track a delivery", to: "/track" },
  },
];

export default function WhoItsFor() {
  return (
    <>
      <div className="page-hero">
        <span className="eyebrow">Three roles, one protocol</span>
        <h1>Built for whoever's holding the package</h1>
        <p className="subtitle center">
          TrackBridge isn't three separate products bolted together — it's one source of truth that
          looks different depending on which side of the delivery you're on.
        </p>
      </div>

      <section className="section">
        <div className="role-detail-grid">
          {ROLES.map((role, i) => (
            <Reveal direction="up" delay={i * 110} key={role.title}>
              <div className="role-detail-card">
                <span className="who-icon">
                  <role.icon size={20} strokeWidth={1.8} />
                </span>
                <h3>{role.title}</h3>
                <p className="muted" style={{ marginTop: "-0.4em" }}>
                  {role.tagline}
                </p>
                <ul>
                  {role.points.map((point) => (
                    <li key={point}>
                      <Check size={15} />
                      {point}
                    </li>
                  ))}
                </ul>
                <Link to={role.cta.to} className="btn btn-outline btn-sm" style={{ marginTop: "1.4rem" }}>
                  {role.cta.label} <ArrowRight size={14} />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal direction="scale" as="section" className="pricing">
        <div>
          <h2>Wherever you fit in, getting started takes minutes.</h2>
          <p>Pick your role and create an account — no credit card required.</p>
        </div>
        <Link to="/register" className="btn btn-accent btn-lg">
          Get started <ArrowRight size={17} />
        </Link>
      </Reveal>
    </>
  );
}
